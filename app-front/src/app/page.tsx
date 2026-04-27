"use client";

import Link from "next/link";
import { useMeetings } from "@/hooks/useMeeting";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

function MeetingsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { meetings, loading, error, refetch } = useMeetings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reuniões</h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {meetings.length} {meetings.length !== 1 ? "reuniões" : "reunião"} no total
            </p>
          )}
        </div>
        <Link href="/meetings/new">
          <Button size="md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova reunião
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}
      {loading && <MeetingsSkeleton />}

      {!loading && !error && meetings.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-900/20">
            📖
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nenhuma reunião</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comece criando uma nova reunião de célula.
          </p>
          <div className="mt-6">
            <Link href="/meetings/new">
              <Button>Criar primeira reunião</Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && meetings.length > 0 && (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
}
