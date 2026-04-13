import { NextRequest, NextResponse } from "next/server";

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

// Extrai a letra do XML — tenta <line> primeiro, fallback para texto limpo
function extractLetra(xml: string): string {
  const lines = [...xml.matchAll(/<line[^>]*>([\s\S]*?)<\/line>/gi)];

  if (lines.length > 0) {
    return lines.map((m) => decodeEntities(m[1].trim())).join("\n");
  }

  // Fallback: remove tags e retorna o texto remanescente (sem o título)
  const semTitulo = xml.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
  return semTitulo
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { numero: string } }
) {
  const { numero } = params;

  // Só aceita dígitos
  if (!/^\d+$/.test(numero)) {
    return NextResponse.json({ error: "Número inválido." }, { status: 400 });
  }

  const url = `https://novocantico.com.br/hino/${numero}/${numero}.xml`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

    if (!res.ok) {
      return NextResponse.json(
        { error: "Hino não encontrado." },
        { status: 404 }
      );
    }

    const xml = await res.text();
    const titulo = extractTag(xml, "title") || extractTag(xml, "titulo");
    const letra = extractLetra(xml);

    if (!titulo && !letra) {
      return NextResponse.json(
        { error: "Não foi possível extrair o hino." },
        { status: 404 }
      );
    }

    return NextResponse.json({ titulo, letra });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar o hino." },
      { status: 500 }
    );
  }
}
