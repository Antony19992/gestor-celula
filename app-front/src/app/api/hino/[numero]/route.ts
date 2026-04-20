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
  const titleMatch = html.match(/<h1[^>]*id="titulo-cantor"[^>]*>([\s\S]*?)<\/h1>/i);
  const titleRaw = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";
  const titulo = titleRaw.replace(/^\d+\s*[-–]\s*/, "").trim();

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

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export async function GET(
  _req: NextRequest,
  { params }: { params: { numero: string } }
) {
  const { numero } = params;

  if (!/^\d+$/.test(numero)) {
    return NextResponse.json({ error: "Número inválido." }, { status: 400 });
  }

  // 1. Tenta servir do banco próprio (instantâneo, sem depender do site externo)
  try {
    const dbRes = await fetch(`${BACKEND_URL}/api/hino/${numero}`, { cache: "no-store" });
    if (dbRes.ok) {
      const hino = await dbRes.json();
      return NextResponse.json({ titulo: hino.titulo, blocos: hino.blocos });
    }
  } catch {
    // Backend fora do ar — cai no scraping normalmente
  }

  // 2. Não está no banco: busca no site externo
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

    // 3. Persiste no banco em background — não bloqueia a resposta
    fetch(`${BACKEND_URL}/api/hino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: parseInt(numero, 10), titulo, blocos }),
    }).catch(() => {});

    return NextResponse.json({ titulo, blocos });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar o hino." }, { status: 500 });
  }
}
