"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageSpinner } from "@/components/ui/Spinner";

interface Hino {
  numero: number;
  titulo: string;
}

export default function HinosPage() {
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/hinos")
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d.error))))
      .then(setHinos)
      .catch((e) => setErro(typeof e === "string" ? e : "Erro ao carregar hinos."))
      .finally(() => setLoading(false));
  }, []);

  // Filtra por número ou título
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return hinos;
    return hinos.filter(
      (h) =>
        h.titulo.toLowerCase().includes(q) ||
        String(h.numero).includes(q)
    );
  }, [hinos, busca]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hinos</h1>
        {!loading && !erro && (
          <p className="mt-0.5 text-sm text-gray-500">
            {hinos.length} hinos no hinário
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && <PageSpinner />}

      {/* Erro */}
      {erro && !loading && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-red-600">{erro}</p>
        </div>
      )}

      {/* Campo de busca */}
      {!loading && !erro && (
        <input
          type="text"
          placeholder="Buscar por número ou título…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      )}

      {/* Lista */}
      {!loading && !erro && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {filtrados.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhum hino encontrado.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtrados.map((hino) => (
                <li key={hino.numero}>
                  <Link
                    href={`/hino/${hino.numero}`}
                    className="flex items-center gap-4 px-4 py-3.5
                               transition-colors hover:bg-blue-50 active:bg-blue-100"
                  >
                    {/* Número */}
                    <span className="w-10 shrink-0 text-right text-sm font-bold text-blue-600">
                      {hino.numero}
                    </span>

                    {/* Título */}
                    <span className="text-sm text-gray-800">{hino.titulo}</span>

                    {/* Seta */}
                    <svg
                      className="ml-auto h-4 w-4 shrink-0 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
