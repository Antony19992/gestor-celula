"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageSpinner } from "@/components/ui/Spinner";
import { localCache } from "@/lib/local-cache";
import { useFontSize } from "@/hooks/useFontSize";

interface Hino {
  numero: number;
  titulo: string;
}

const CACHE_KEY = "hinos";
const CACHE_TTL = 60 * 60 * 1000;

export default function HinosPage() {
  const { fontSize, cycleFontSize } = useFontSize();
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const cached = localCache.get<Hino[]>(CACHE_KEY);
    if (cached) {
      setHinos(cached.data);
      setLoading(false);
      if (!localCache.isStale(cached, CACHE_TTL)) return;
    }
    const silent = !!cached;
    fetch("/api/hinos")
      .then((r) => r.ok ? r.json() : r.json().then((d: { error: string }) => Promise.reject(d.error)))
      .then((data: Hino[]) => { localCache.set(CACHE_KEY, data); setHinos(data); })
      .catch((e) => { if (!silent) setErro(typeof e === "string" ? e : "Erro ao carregar hinos."); })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return hinos;
    return hinos.filter((h) => h.titulo.toLowerCase().includes(q) || String(h.numero).includes(q));
  }, [hinos, busca]);

  const fontSizeBtn = "flex-shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hinos</h1>
          {!loading && !erro && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {hinos.length} hinos no hinário
            </p>
          )}
        </div>
        <button onClick={cycleFontSize} title="Tamanho do texto" className={fontSizeBtn}>
          <span className={`font-semibold text-gray-600 dark:text-gray-300 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-base" : "text-lg"}`}>A</span>
          <span className="ml-0.5 text-xs text-blue-500">{fontSize === "sm" ? "" : fontSize === "base" ? "+" : "++"}</span>
        </button>
      </div>

      {loading && <PageSpinner />}

      {erro && !loading && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
          <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
        </div>
      )}

      {!loading && !erro && (
        <div className="sticky top-14 z-30 -mx-4 border-b border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
          <input
            type="text"
            placeholder="Buscar por número ou título…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
      )}

      {!loading && !erro && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">
          {filtrados.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              Nenhum hino encontrado.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtrados.map((hino) => (
                <li key={hino.numero}>
                  <Link
                    href={`/hino/${hino.numero}`}
                    className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/20 dark:active:bg-blue-900/30"
                  >
                    <span className={`w-10 shrink-0 text-right font-bold text-blue-600 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-lg" : "text-2xl"}`}>
                      {hino.numero}
                    </span>
                    <span className={`text-gray-800 dark:text-gray-200 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-lg" : "text-2xl"}`}>
                      {hino.titulo}
                    </span>
                    <svg className="ml-auto h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
