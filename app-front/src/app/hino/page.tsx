"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

interface Bloco {
  tipo: "estrofe" | "coro";
  linhas: string[];
}

interface HinoData {
  titulo: string;
  blocos: Bloco[];
}

export default function HinoPage() {
  const [numero, setNumero] = useState("");
  const [hino, setHino] = useState<HinoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleBuscar(e: FormEvent) {
    e.preventDefault();

    // Validação client-side: só números
    if (!/^\d+$/.test(numero.trim())) {
      setErro("Digite apenas números.");
      return;
    }

    setLoading(true);
    setErro(null);
    setHino(null);

    try {
      const res = await fetch(`/api/hino/${numero.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Hino não encontrado.");
        return;
      }

      setHino(data);
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buscar Hino</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Busca pelo número no hinário Novo Cântico
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <form onSubmit={handleBuscar} className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="Número do hino"
            value={numero}
            onChange={(e) => {
              // Só permite dígitos no input
              const val = e.target.value.replace(/\D/g, "");
              setNumero(val);
              setErro(null);
            }}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       disabled:bg-gray-50"
            disabled={loading}
            maxLength={4}
          />
          <Button type="submit" loading={loading} disabled={!numero}>
            Buscar
          </Button>
        </form>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {/* Erro */}
      {erro && !loading && (
        <Card>
          <p className="text-sm text-red-600">{erro}</p>
        </Card>
      )}

      {/* Resultado */}
      {hino && !loading && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900">{hino.titulo}</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed">
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
