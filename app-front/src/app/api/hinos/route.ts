import { NextResponse } from "next/server";

// Impede pré-renderização em build time
export const dynamic = "force-dynamic";

interface Hino {
  numero: number;
  titulo: string;
}

// Cache em memória com TTL de 1 hora
let cache: { data: Hino[]; expiresAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

// Remove tags HTML e decodifica entidades básicas
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&nbsp;/g, " ")
    .trim();
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
      return NextResponse.json(
        { error: "Erro ao buscar índice de hinos." },
        { status: 502 }
      );
    }

    const html = await res.text();
    const hinos: Hino[] = [];
    const seen = new Set<number>();

    // Extrai todo texto que casa com "número - título"
    // Funciona tanto em texto puro quanto dentro de tags <a>, <td>, <li>, etc.
    const pattern = /(\d{1,3})\s*[-–]\s*([A-Za-zÀ-ÿ][^<\n\r]{2,80})/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(html)) !== null) {
      const numero = parseInt(match[1], 10);
      const titulo = stripHtml(match[2]).trim();

      if (!seen.has(numero) && titulo.length > 1) {
        seen.add(numero);
        hinos.push({ numero, titulo });
      }
    }

    if (hinos.length === 0) {
      return NextResponse.json(
        { error: "Nenhum hino encontrado." },
        { status: 404 }
      );
    }

    hinos.sort((a, b) => a.numero - b.numero);
    cache = { data: hinos, expiresAt: Date.now() + CACHE_TTL };

    return NextResponse.json(hinos);
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar hinos." },
      { status: 500 }
    );
  }
}
