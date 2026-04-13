import { NextRequest, NextResponse } from "next/server";

export interface Bloco {
  tipo: "estrofe" | "coro";
  linhas: string[];
}

// Decodifica entidades XML comuns
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

// Extrai o conteúdo de uma tag XML específica
function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
}

// Extrai versos de dentro de um trecho XML
function extractVersos(xml: string): string[] {
  return [...xml.matchAll(/<verso[^>]*>([\s\S]*?)<\/verso>/gi)].map((v) =>
    decodeEntities(v[1].trim())
  );
}

// Extrai blocos tipados do XML
function extractBlocos(xml: string): Bloco[] {
  const blocos: Bloco[] = [];

  // Formato Novo Cântico: <estrofe> com <verso> e opcional <coro>
  const estrofes = [...xml.matchAll(/<estrofe[^>]*>([\s\S]*?)<\/estrofe>/gi)];
  if (estrofes.length > 0) {
    for (const estrofe of estrofes) {
      // Versos da estrofe (fora do coro)
      const semCoro = estrofe[1].replace(/<coro[^>]*>[\s\S]*?<\/coro>/gi, "");
      const versosFora = extractVersos(semCoro);
      if (versosFora.length > 0) {
        blocos.push({ tipo: "estrofe", linhas: versosFora });
      }

      // Coro(s) dentro da estrofe
      const coros = [...estrofe[1].matchAll(/<coro[^>]*>([\s\S]*?)<\/coro>/gi)];
      for (const coro of coros) {
        const versosCoro = extractVersos(coro[1]);
        if (versosCoro.length > 0) {
          blocos.push({ tipo: "coro", linhas: versosCoro });
        }
      }
    }
    return blocos;
  }

  // Formato alternativo: <line>
  const lines = [...xml.matchAll(/<line[^>]*>([\s\S]*?)<\/line>/gi)].map((m) =>
    decodeEntities(m[1].trim())
  );
  if (lines.length > 0) {
    blocos.push({ tipo: "estrofe", linhas: lines });
    return blocos;
  }

  // Fallback: texto limpo sem metadados
  const semMeta = xml
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<titulo[^>]*>[\s\S]*?<\/titulo>/gi, "")
    .replace(/<number[^>]*>[\s\S]*?<\/number>/gi, "")
    .replace(/<numero[^>]*>[\s\S]*?<\/numero>/gi, "");
  const linhasFallback = semMeta
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\d+$/.test(l));
  if (linhasFallback.length > 0) {
    blocos.push({ tipo: "estrofe", linhas: linhasFallback });
  }

  return blocos;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { numero: string } }
) {
  const { numero } = params;

  if (!/^\d+$/.test(numero)) {
    return NextResponse.json({ error: "Número inválido." }, { status: 400 });
  }

  // O site usa números com zero à esquerda (1 → 001, 10 → 010)
  const padded = numero.padStart(3, "0");
  const url = `https://novocantico.com.br/hino/${padded}/${padded}.xml`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Hino não encontrado." }, { status: 404 });
    }

    const xml = await res.text();
    const titulo = extractTag(xml, "title") || extractTag(xml, "titulo");
    const blocos = extractBlocos(xml);

    if (!titulo && blocos.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível extrair o hino." },
        { status: 404 }
      );
    }

    return NextResponse.json({ titulo, blocos });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar o hino." }, { status: 500 });
  }
}
