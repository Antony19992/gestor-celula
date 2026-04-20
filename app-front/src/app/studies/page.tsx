"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { studyService, CreateStudyPayload } from "@/services/study";
import { StudyForm } from "@/components/study/StudyForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Study, ApiError } from "@/types";
import { localCache } from "@/lib/local-cache";

const CACHE_KEY = "studies";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStudies = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await studyService.getAll();
      localCache.set(CACHE_KEY, data);
      setStudies(data);
    } catch (err) {
      if (!silent) setError((err as ApiError).message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localCache.get<Study[]>(CACHE_KEY);
    if (cached) {
      setStudies(cached.data);
      setLoading(false);
      if (localCache.isStale(cached, CACHE_TTL)) {
        fetchStudies(true);
      }
    } else {
      fetchStudies();
    }
  }, [fetchStudies]);

  async function handleCreate(payload: CreateStudyPayload) {
    setCreating(true);
    setFormError(null);
    try {
      const created = await studyService.create(payload);
      setStudies((prev) => {
        const updated = [...prev, created];
        localCache.set(CACHE_KEY, updated);
        return updated;
      });
      setIsModalOpen(false);
    } catch (err) {
      setFormError((err as ApiError).message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await studyService.delete(id);
      setStudies((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        localCache.set(CACHE_KEY, updated);
        return updated;
      });
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudos</h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-gray-500">
              {studies.length} estudo{studies.length !== 1 ? "s" : ""} cadastrado
              {studies.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo estudo
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStudies} />}

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && !error && studies.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            📖
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Nenhum estudo</h2>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre um estudo para usar nas reuniões.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>Criar primeiro estudo</Button>
          </div>
        </div>
      )}

      {!loading && studies.length > 0 && (
        <div className="space-y-3">
          {studies.map((study) => (
            <Card key={study.id} className="flex items-start justify-between gap-3">
              <Link href={`/studies/${study.id}`} className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900">{study.title}</h3>
                <p className="mt-0.5 text-sm italic text-gray-500">{study.verse}</p>
                {study.questions.length > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    {study.questions.length} pergunta{study.questions.length !== 1 ? "s" : ""}
                  </p>
                )}
              </Link>
              <button
                onClick={() => handleDelete(study.id)}
                title="Remover"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
        }}
        title="Novo estudo"
      >
        <StudyForm onSubmit={handleCreate} loading={creating} error={formError} />
      </Modal>
    </div>
  );
}
