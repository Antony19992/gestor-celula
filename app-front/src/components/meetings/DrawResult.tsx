"use client";

import { DrawResult } from "@/types";
import { Button } from "@/components/ui/Button";

interface DrawResultProps {
  result: DrawResult;
  onAnswer: () => void;
  onRedraw: () => void;
  loading: boolean;
}

export function DrawResultCard({
  result,
  onAnswer,
  onRedraw,
  loading,
}: DrawResultProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white shadow-xl">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm">
          🎯
        </div>
        <p className="text-sm font-medium text-blue-100">Foi escolhido(a)</p>
        <h2 className="mt-1 text-2xl font-bold">{result.memberName}</h2>
        {result.timesSelectedInThisMeeting > 1 && (
          <p className="mt-1 text-xs text-blue-200">
            {result.timesSelectedInThisMeeting}ª vez neste encontro
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          fullWidth
          onClick={onAnswer}
          className="border-white/30 bg-white/20 text-white hover:bg-white/30"
        >
          Responder
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onRedraw}
          loading={loading}
          className="border-white/30 bg-white/20 text-white hover:bg-white/30"
        >
          Sortear outro
        </Button>
      </div>
    </div>
  );
}
