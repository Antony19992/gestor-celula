import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Hino {
  numero: number;
  titulo: string;
}

let cache: { data: Hino[]; expiresAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)));
}

function parseHinos(html: string): Hino[] {
  // 1. Remove scripts e styles
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // 2. Troca tags por quebra de linha — o texto das âncoras fica preservado
  text = text.replace(/<[^>]+>/g, "\n");

  // 3. Decodifica entidades
  text = decodeEntities(text);

  const hinos: Hino[] = [];
  const seen = new Set<number>();

  for (const raw of text.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;

    // Formato "110-A · Crer e Observar" ou "110 · Crer e Observar"
    const m1 = line.match(/^(\d+)(?:-[A-Za-z]+)?\s*[·•]\s*(.+)$/);
    // Formato "110 - Crer e Observar"
    const m2 = line.match(/^(\d+)\s*[-–]\s*(.+)$/);

    const m = m1 ?? m2;
    if (!m) continue;

    const numero = parseInt(m[1], 10);
    const titulo = m[2].trim();

    if (numero > 0 && numero <= 2000 && titulo.length > 1 && !seen.has(numero)) {
      seen.add(numero);
      hinos.push({ numero, titulo });
    }
  }

  return hinos.sort((a, b) => a.numero - b.numero);
}

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch("https://novocantico.com.br/indice/assunto/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao buscar índice." }, { status: 502 });
    }

    const html = await res.text();
    const hinos = parseHinos(html);

    if (hinos.length === 0) {
      return NextResponse.json({ error: "Nenhum hino encontrado." }, { status: 404 });
    }

    cache = { data: hinos, expiresAt: Date.now() + CACHE_TTL };
    return NextResponse.json(hinos);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
