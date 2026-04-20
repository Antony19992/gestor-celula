"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useFontSize } from "@/hooks/useFontSize";

interface Bloco {
  tipo: "estrofe" | "coro";
  linhas: string[];
}

interface HinoData {
  titulo: string;
  blocos: Bloco[];
}

export default function HinoPage() {
  const { numero } = useParams<{ numero: string }>();
  const [hino, setHino] = useState<HinoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { fontSize, cycleFontSize } = useFontSize();

  useEffect(() => {
    fetch(`/api/hino/${numero}`)
      .then((r) =>
        r.ok ? r.json() : r.json().then((d) => Promise.reject(d.error))
      )
      .then(setHino)
      .catch((e) =>
        setErro(typeof e === "string" ? e : "Hino não encontrado.")
      )
      .finally(() => setLoading(false));
  }, [numero]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link
          href="/hinos"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="flex-1 text-xl font-bold text-gray-900">Hino {numero}</h1>
        <button
          onClick={cycleFontSize}
          title="Tamanho do texto"
          className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-gray-50"
        >
          <span className={`font-semibold text-gray-600 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-base" : "text-lg"}`}>
            A
          </span>
          <span className="ml-0.5 text-xs text-blue-500">
            {fontSize === "sm" ? "" : fontSize === "base" ? "+" : "++"}
          </span>
        </button>
      </div>

      {loading && <PageSpinner />}

      {erro && !loading && (
        <Card>
          <p className="text-sm text-red-600">{erro}</p>
        </Card>
      )}

      {hino && !loading && (
        <Card>
          <h2 className="text-lg font-bold text-gray-900">{hino.titulo}</h2>
          <div className={`mt-4 space-y-4 leading-relaxed ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-base" : "text-lg"}`}>
            {hino.blocos.map((bloco, i) => (
              <div key={i}>
                {bloco.linhas.map((linha, j) => (
                  <p
                    key={j}
                    className={bloco.tipo === "coro" ? "font-bold text-gray-900" : "text-gray-700"}
                  >
                    {linha}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
