"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMeeting } from "@/hooks/useMeeting";
import { useFontSize } from "@/hooks/useFontSize";
import { studyService } from "@/services/study";
import { Study } from "@/types";
import { StudyViewer } from "@/components/study/StudyViewer";
import { QuestionItem } from "@/components/study/QuestionItem";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface PageProps {
  params: { id: string };
}

const tabItems = [
  { key: "study", label: "Estudo" },
  { key: "questions", label: "Perguntas" },
] as const;

type Tab = (typeof tabItems)[number]["key"];

export default function MeetingPage({ params }: PageProps) {
  const id = Number(params.id);

  const {
    meeting,
    loading,
    error,
    drawResult,
    drawing,
    drawMember,
    clearDraw,
    refetch,
  } = useMeeting(id);

  const { fontSize, cycleFontSize } = useFontSize();
  const [activeTab, setActiveTab] = useState<Tab>("study");
  const [study, setStudy] = useState<Study | null>(null);

  // Índice da pergunta que disparou o último sorteio
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);

  useEffect(() => {
    if (meeting?.studyId) {
      studyService.getById(meeting.studyId).then(setStudy).catch(console.error);
    }
  }, [meeting?.studyId]);

  async function handleDraw(idx: number) {
    setActiveQuestionIdx(idx);
    await drawMember();
  }

  function handleClearDraw() {
    setActiveQuestionIdx(null);
    clearDraw();
  }

  if (loading) return <PageSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!meeting) return null;

  const questions = study?.questions ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-gray-900">
            {meeting.studyTitle || "Reunião"}
          </h1>
          <p className="text-xs text-gray-500">
            {new Date(meeting.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
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

      {study ? (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.key === "questions" && questions.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
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
                <p className="py-8 text-center text-sm text-gray-400">
                  Nenhuma pergunta cadastrada para este estudo.
                </p>
              ) : (
                questions.map((text, idx) => (
                  <QuestionItem
                    key={idx}
                    text={text}
                    order={idx + 1}
                    onDraw={() => handleDraw(idx)}
                    drawResult={activeQuestionIdx === idx ? drawResult : null}
                    isActive={activeQuestionIdx === idx}
                    drawing={drawing}
                    onClearDraw={handleClearDraw}
                    fontSize={fontSize}
                  />
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-gray-400">
          <p className="text-sm">Esta reunião não possui estudo vinculado.</p>
        </div>
      )}
    </div>
  );
}
