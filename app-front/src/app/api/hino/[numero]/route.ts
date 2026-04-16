import { NextRequest, NextResponse } from "next/server";

export interface Bloco {
  tipo: "estrofe" | "coro";
  linhas: string[];
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function parseHino(html: string): { titulo: string; blocos: Bloco[] } {
  // Título: <h1 id="titulo-cantor">375 - Segurança</h1>
  const titleMatch = html.match(/<h1[^>]*id="titulo-cantor"[^>]*>([\s\S]*?)<\/h1>/i);
  const titleRaw = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";
  const titulo = titleRaw.replace(/^\d+\s*[-–]\s*/, "").trim();

  // Conteúdo: <div id="conteudoCantor">
  const contentMatch = html.match(/<div[^>]*id="conteudoCantor"[^>]*>([\s\S]*?)<\/div>/i);
  if (!contentMatch || !titulo) return { titulo, blocos: [] };

  const paragraphs = [...contentMatch[1].matchAll(/<p[^>]*class="lead"[^>]*>([\s\S]*?)<\/p>/gi)];

  const blocos: Bloco[] = [];
  let currentTipo: "estrofe" | "coro" | null = null;
  let currentLinhas: string[] = [];

  function flush() {
    if (currentLinhas.length > 0 && currentTipo) {
      blocos.push({ tipo: currentTipo, linhas: [...currentLinhas] });
    }
    currentLinhas = [];
    currentTipo = null;
  }

  for (const p of paragraphs) {
    const inner = p[1];
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) { flush(); continue; }

    const isCoro = /<b>/i.test(inner);
    const tipo: "estrofe" | "coro" = isCoro ? "coro" : "estrofe";

    // Remove prefixo * do coro e numeração N. da estrofe
    const line = decodeEntities(text)
      .replace(/^\*\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

    if (!line) continue;

    if (currentTipo !== tipo) flush();
    currentTipo = tipo;
    currentLinhas.push(line);
  }
  flush();

  return { titulo, blocos };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { numero: string } }
) {
  const { numero } = params;

  if (!/^\d+$/.test(numero)) {
    return NextResponse.json({ error: "Número inválido." }, { status: 400 });
  }

  const url = `https://cristaonarede.com.br/hinarios/cantor/texto/?id=${numero}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Hino não encontrado." }, { status: 404 });
    }

    const html = await res.text();
    const { titulo, blocos } = parseHino(html);

    if (!titulo) {
      return NextResponse.json({ error: "Hino não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ titulo, blocos });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar o hino." }, { status: 500 });
  }
}