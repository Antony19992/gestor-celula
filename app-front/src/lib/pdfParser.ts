import type { CreateStudyPayload } from "@/services/study";

// ─── Extração por posição Y — reconstrói linhas visuais ───────────────────────

async function extractLinesFromPDF(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allLines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Agrupa itens de texto pela posição Y (PDF: Y cresce de baixo para cima)
    const lineMap = new Map<number, Array<{ x: number; width: number; text: string }>>();
    const Y_TOLERANCE = 3;

    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      const width = item.width ?? 0;

      let bucketY: number | undefined;
      for (const existingY of Array.from(lineMap.keys())) {
        if (Math.abs(existingY - y) <= Y_TOLERANCE) {
          bucketY = existingY;
          break;
        }
      }

      if (bucketY === undefined) {
        lineMap.set(y, [{ x, width, text: item.str }]);
      } else {
        lineMap.get(bucketY)!.push({ x, width, text: item.str });
      }
    }

    // Ordena: Y decrescente = topo para base; dentro de cada linha, X crescente = esquerda para direita
    const sorted = [...lineMap.entries()]
      .sort(([ya], [yb]) => yb - ya)
      .map(([, items]) => {
        items.sort((a, b) => a.x - b.x);
        // Junta usando o gap entre items: sem espaço se adjacentes, com espaço se há gap
        let text = items[0]?.text ?? "";
        for (let i = 1; i < items.length; i++) {
          const prev = items[i - 1];
          const curr = items[i];
          const gap = curr.x - (prev.x + prev.width);
          text += gap > 1 ? " " + curr.text : curr.text;
        }
        return text.replace(/\s+/g, " ").trim();
      });

    allLines.push(...sorted);
  }

  return allLines;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBullet(line: string): string | null {
  const match = line.match(/^\s*[•\-\*]\s+(.+)/);
  return match ? match[1].trim() : null;
}

function isNumberedItem(line: string): string | null {
  const match = line.match(/^\s*\d+[\.\)]\s+(.+)/);
  return match ? match[1].trim() : null;
}

// ─── Tipo de seção ────────────────────────────────────────────────────────────

type Section =
  | "NONE"
  | "INTRO"
  | "EXPLANATION"
  | "QUESTIONS"
  | "APP_INDIVIDUAL"
  | "APP_GROUP"
  | "PRAYER"
  | "CONCLUSION";

// ─── Parser principal ──────────────────────────────────────────────────────────

export async function parsePDFToStudy(
  file: File
): Promise<Partial<CreateStudyPayload>> {
  const lines = await extractLinesFromPDF(file);

  const result: Partial<CreateStudyPayload> = {
    questions: [],
    prayerTopics: [],
  };

  let section: Section = "NONE";
  const buffers: Partial<Record<Section, string[]>> = {};
  const buf = (s: Section): string[] => {
    if (!buffers[s]) buffers[s] = [];
    return buffers[s]!;
  };

  let verseFound = false;
  let lastLine = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // ── Ignorar rodapé/cabeçalho fixo ──
    if (/^Informar as Atividades/i.test(line)) continue;
    // ── Ignorar linha de roteiro/semana ──
    if (/^ROTEIRO:/i.test(line)) continue;

    // ── Versículo: linha entre # ... # — o título é a linha anterior ──
    if (!verseFound && /^#.+#$/.test(line)) {
      result.verse = line.replace(/#/g, "").trim();
      verseFound = true;
      if (lastLine) result.title = lastLine;
      lastLine = "";
      continue;
    }

    lastLine = line;

    // ── Cabeçalhos de seção (ALL CAPS) ──

    if (/^INTRODUÇÃO/i.test(line)) {
      section = "INTRO";
      continue;
    }
    if (/^QUESTÕES PARA REFLEXÃO|^PERGUNTAS PARA REFLEXÃO|^QUESTÕES|^PERGUNTAS/i.test(line)) {
      section = "QUESTIONS";
      continue;
    }
    if (/^APLICAÇÃO/i.test(line)) {
      // Não mapeia para buffer próprio — espera pelos labels inline
      section = "NONE";
      continue;
    }
    if (/^ORAÇÃO/i.test(line)) {
      section = "PRAYER";
      continue;
    }
    if (/^CONCLUSÃO/i.test(line)) {
      section = "CONCLUSION";
      continue;
    }

    // ── Labels inline que mudam de seção ──

    // "Leitura dos Versículos:" → conteúdo da INTRODUÇÃO
    if (/^Leitura dos Versículos\s*:/i.test(line)) {
      const rest = line.replace(/^Leitura dos Versículos\s*:\s*/i, "").trim();
      if (rest && section === "INTRO") buf("INTRO").push(rest);
      continue;
    }

    // "Explicação:" (dentro da INTRODUÇÃO) → inicia seção EXPLANATION
    if (section === "INTRO" && /^Explicação\s*:/i.test(line)) {
      section = "EXPLANATION";
      const rest = line.replace(/^Explicação\s*:\s*/i, "").trim();
      if (rest) buf("EXPLANATION").push(rest);
      continue;
    }

    // "Individual:" → inicia APP_INDIVIDUAL (em qualquer ponto)
    if (/^Individual\s*:/i.test(line)) {
      section = "APP_INDIVIDUAL";
      const rest = line.replace(/^Individual\s*:\s*/i, "").trim();
      if (rest) buf("APP_INDIVIDUAL").push(rest);
      continue;
    }

    // "Em grupo:" → inicia APP_GROUP
    if (/^Em grupo\s*:/i.test(line)) {
      section = "APP_GROUP";
      const rest = line.replace(/^Em grupo\s*:\s*/i, "").trim();
      if (rest) buf("APP_GROUP").push(rest);
      continue;
    }

    // ── Acumula na seção atual ──
    if (section !== "NONE") {
      buf(section).push(line);
    }
  }

  // ── Pós-processamento ──────────────────────────────────────────────────────

  if (buffers["INTRO"])
    result.introduction = buffers["INTRO"].join(" ").trim();

  if (buffers["EXPLANATION"])
    result.explanation = buffers["EXPLANATION"].join(" ").trim();

  if (buffers["QUESTIONS"]) {
    const qs: string[] = [];
    let current = "";

    for (const line of buffers["QUESTIONS"]) {
      const bullet = isBullet(line) ?? isNumberedItem(line);

      if (bullet !== null) {
        // Inicia nova questão — salva a anterior se existir
        if (current.trim()) qs.push(current.trim());
        current = bullet;
      } else if (current) {
        // Continuação da questão atual (linha quebrada no PDF)
        current += " " + line.trim();
      }

      // Finaliza quando chega ao ponto de interrogação
      if (current.endsWith("?")) {
        qs.push(current.trim());
        current = "";
      }
    }
    // Salva qualquer questão incompleta restante
    if (current.trim()) qs.push(current.trim());

    if (qs.length > 0) result.questions = qs;
  }

  if (buffers["APP_INDIVIDUAL"])
    result.applicationIndividual = buffers["APP_INDIVIDUAL"].join(" ").trim();

  if (buffers["APP_GROUP"])
    result.applicationGroup = buffers["APP_GROUP"].join(" ").trim();

  if (buffers["PRAYER"]) {
    const topics: string[] = [];
    let current = "";

    for (const line of buffers["PRAYER"]) {
      const bullet = isBullet(line) ?? isNumberedItem(line);

      if (bullet !== null) {
        if (current.trim()) topics.push(current.trim());
        current = bullet;
      } else if (current) {
        // Continuação de tópico que quebrou linha
        current += " " + line.trim();
      }
    }
    if (current.trim()) topics.push(current.trim());

    if (topics.length > 0) result.prayerTopics = topics;
  }

  if (buffers["CONCLUSION"])
    result.conclusion = buffers["CONCLUSION"].join(" ").trim();

  return result;
}
