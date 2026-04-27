import { localCache } from "@/lib/local-cache";

export async function fetchBibleBook(abbrev: string): Promise<string[][]> {
  const cached = localCache.get<string[][]>(`biblia:${abbrev}`);
  if (cached) return cached.data;

  const url = `/biblia/${encodeURIComponent(abbrev)}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Não foi possível carregar o livro (${res.status})`);

  const chapters: string[][] = await res.json();
  localCache.set(`biblia:${abbrev}`, chapters);
  return chapters;
}
