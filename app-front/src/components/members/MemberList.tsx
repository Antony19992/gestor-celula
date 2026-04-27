"use client";

import { Member } from "@/types";

interface MemberListProps {
  members: Member[];
  onDelete: (id: number) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function MemberList({ members, onDelete }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 dark:text-gray-500">
        <svg
          className="mx-auto mb-3 h-12 w-12 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm">Nenhum membro cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {getInitials(member.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {member.name}
            </p>
          </div>

          <button
            onClick={() => onDelete(member.id)}
            title="Remover"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
