import Link from "next/link";
import { Meeting } from "@/types";
import { Card } from "@/components/ui/Card";

interface MeetingCardProps {
  meeting: Meeting;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="cursor-pointer transition-all hover:border-blue-300 hover:shadow-md group mt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {meeting.studyTitle || "Reunião"}
            </span>
            <p className="mt-1 text-sm capitalize text-gray-500">
              {formatDate(meeting.date)}
            </p>
          </div>
          <svg
            className="h-5 w-5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-blue-400"
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
        </div>
      </Card>
    </Link>
  );
}
