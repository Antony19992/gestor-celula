"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { studyService } from "@/services/study";
import { Study } from "@/types";
import { StudyViewer } from "@/components/study/StudyViewer";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useFontSize } from "@/hooks/useFontSize";
import { localCache } from "@/lib/local-cache";

const tabItems = [
  { key: "study", label: "Estudo" },
  { key: "questions", label: "Perguntas" },
] as const;

type Tab = (typeof tabItems)[number]["key"];

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("study");
  const { fontSize, cycleFontSize } = useFontSize();

  useEffect(() => {
    const cached = localCache.get<Study[]>("studies");
    const fromCache = cached?.data.find((s) => s.id === Number(id));
    if (fromCache) {
      setStudy(fromCache);
      setLoading(false);
      return;
    }
    studyService.getById(Number(id)).then(setStudy).catch(() => setError("Estudo não encontrado.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;

  if (error || !study) {
    return (
      <div className="space-y-4">
        <Link href="/studies" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          ← Voltar
        </Link>
        <Card><p className="text-sm text-red-600 dark:text-red-400">{error ?? "Estudo não encontrado."}</p></Card>
      </div>
    );
  }

  const questions = study.questions ?? [];
  const fontSizeBtn = "flex-shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/studies" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white">{study.title}</h1>
          <p className="text-xs italic text-gray-500 dark:text-gray-400">{study.verse}</p>
        </div>
        <button onClick={cycleFontSize} title="Tamanho do texto" className={fontSizeBtn}>
          <span className={`font-semibold text-gray-600 dark:text-gray-300 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-base" : "text-lg"}`}>A</span>
          <span className="ml-0.5 text-xs text-blue-500">{fontSize === "sm" ? "" : fontSize === "base" ? "+" : "++"}</span>
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
            {tab.key === "questions" && questions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {questions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "study" && <StudyViewer study={study} fontSize={fontSize} />}

      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              Nenhuma pergunta cadastrada para este estudo.
            </p>
          ) : (
            questions.map((text, idx) => (
              <Card key={idx}>
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  <p className={`flex-1 pt-0.5 leading-relaxed text-gray-800 dark:text-gray-200 ${fontSize === "sm" ? "text-sm" : fontSize === "base" ? "text-lg" : "text-2xl"}`}>
                    {text}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
