"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { meetingsService } from "@/services/meetings";
import { studyService } from "@/services/study";
import { Study, ApiError } from "@/types";
import { Button } from "@/components/ui/Button";
import { localCache } from "@/lib/local-cache";

const STUDIES_CACHE_KEY = "studies";
const STUDIES_TTL = 5 * 60 * 1000;

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

export function NewMeetingForm() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [studyId, setStudyId] = useState<string>("");
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localCache.get<Study[]>(STUDIES_CACHE_KEY);
    if (cached) {
      setStudies(cached.data);
      if (!localCache.isStale(cached, STUDIES_TTL)) return;
    }
    studyService
      .getAll()
      .then((data) => {
        localCache.set(STUDIES_CACHE_KEY, data);
        setStudies(data);
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!studyId) {
      setError("Selecione um estudo para o encontro.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const meeting = await meetingsService.create({
        date,
        studyId: Number(studyId),
      });
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError((err as ApiError).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="date" className={labelCls}>
          Data e hora
        </label>
        <input
          id="date"
          type="datetime-local"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="study" className={labelCls}>
          Estudo <span className="text-red-500">*</span>
        </label>
        <select
          id="study"
          required
          value={studyId}
          onChange={(e) => setStudyId(e.target.value)}
          className={inputCls}
        >
          <option value="">Selecione um estudo</option>
          {studies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} — {s.verse}
            </option>
          ))}
        </select>
        {studies.length === 0 && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Nenhum estudo cadastrado ainda.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} fullWidth size="lg">
        Criar reunião
      </Button>
    </form>
  );
}
