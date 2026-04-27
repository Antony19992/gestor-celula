"use client";

import { useState } from "react";
import { DrawResult } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DrawResultCard } from "@/components/meetings/DrawResult";
import { FontSize } from "@/hooks/useFontSize";

const textClass: Record<FontSize, string> = {
  sm: "text-sm",
  base: "text-lg",
  lg: "text-2xl",
};

interface QuestionItemProps {
  text: string;
  order: number;
  onDraw: () => Promise<void>;
  drawResult: DrawResult | null;
  isActive: boolean;
  drawing: boolean;
  onClearDraw: () => void;
  fontSize?: FontSize;
}

export function QuestionItem({
  text,
  order,
  onDraw,
  drawResult,
  isActive,
  drawing,
  onClearDraw,
  fontSize = "sm",
}: QuestionItemProps) {
  const [answered, setAnswered] = useState(false);

  function handleAnswer() {
    setAnswered(true);
    onClearDraw();
  }

  return (
    <Card
      className={
        isActive && drawResult
          ? "border-blue-300 ring-1 ring-blue-300"
          : answered
          ? "opacity-60"
          : ""
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {order}
        </span>
        <p className={`flex-1 pt-0.5 leading-relaxed text-gray-800 dark:text-gray-200 ${textClass[fontSize]}`}>
          {text}
        </p>
      </div>

      {answered ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
          <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Respondida</span>
        </div>
      ) : isActive && drawResult ? (
        <div className="mt-4">
          <DrawResultCard
            result={drawResult}
            onAnswer={handleAnswer}
            onRedraw={onDraw}
            loading={drawing}
          />
        </div>
      ) : (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onDraw}
            loading={drawing && isActive}
            disabled={drawing && !isActive}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sortear pessoa
          </Button>
        </div>
      )}
    </Card>
  );
}
