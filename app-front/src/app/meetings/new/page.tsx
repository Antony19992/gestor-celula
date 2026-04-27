import Link from "next/link";
import { NewMeetingForm } from "@/components/meetings/NewMeetingForm";
import { Card } from "@/components/ui/Card";

export default function NewMeetingPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nova reunião</h1>
      </div>

      <Card>
        <NewMeetingForm />
      </Card>
    </div>
  );
}
