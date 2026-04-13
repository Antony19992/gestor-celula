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

// Extrai a letra do XML — suporta <estrofe>/<verso> (Novo Cântico), <line>, ou fallback texto
function extractLetra(xml: string): string {
  // Formato Novo Cântico: <estrofe> com <verso> e opcional <coro>
  const estrofes = [...xml.matchAll(/<estrofe[^>]*>([\s\S]*?)<\/estrofe>/gi)];
  if (estrofes.length > 0) {
    return estrofes
      .map((estrofe) => {
        const blocos: string[] = [];

        // Versos fora do coro
        const semCoro = estrofe[1].replace(/<coro[^>]*>[\s\S]*?<\/coro>/gi, "");
        const versosFora = [...semCoro.matchAll(/<verso[^>]*>([\s\S]*?)<\/verso>/gi)];
        if (versosFora.length > 0) {
          blocos.push(versosFora.map((v) => decodeEntities(v[1].trim())).join("\n"));
        }

        // Coro (indentado)
        const coros = [...estrofe[1].matchAll(/<coro[^>]*>([\s\S]*?)<\/coro>/gi)];
        for (const coro of coros) {
          const versosCoro = [...coro[1].matchAll(/<verso[^>]*>([\s\S]*?)<\/verso>/gi)];
          if (versosCoro.length > 0) {
            blocos.push(versosCoro.map((v) => "    " + decodeEntities(v[1].trim())).join("\n"));
          }
        }

        return blocos.join("\n");
      })
      .join("\n\n");
  }

  // Formato alternativo: <line>
  const lines = [...xml.matchAll(/<line[^>]*>([\s\S]*?)<\/line>/gi)];
  if (lines.length > 0) {
    return lines.map((m) => decodeEntities(m[1].trim())).join("\n");
  }

  // Fallback: remove metadados e retorna o texto remanescente
  const semMeta = xml
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<titulo[^>]*>[\s\S]*?<\/titulo>/gi, "")
    .replace(/<number[^>]*>[\s\S]*?<\/number>/gi, "")
    .replace(/<numero[^>]*>[\s\S]*?<\/numero>/gi, "");
  return semMeta
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\d+$/.test(l))
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

  // O site usa números com zero à esquerda (1 → 001, 10 → 010)
  const padded = numero.padStart(3, "0");
  const url = `https://novocantico.com.br/hino/${padded}/${padded}.xml`;

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
