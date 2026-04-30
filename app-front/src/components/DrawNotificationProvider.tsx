"use client";

import { useState, useCallback, useRef } from "react";
import { useGlobalSSE, DrawEvent } from "@/hooks/useGlobalSSE";

export function DrawNotificationProvider() {
  const [notification, setNotification] = useState<DrawEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDraw = useCallback((event: DrawEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification(event);
    timerRef.current = setTimeout(() => setNotification(null), 6000);
  }, []);

  useGlobalSSE(handleDraw);

  if (!notification) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-blue-600 px-4 py-3 shadow-2xl text-white">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-blue-100">Sorteado</p>
          <p className="truncate text-lg font-bold">{notification.memberName}</p>
        </div>
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setNotification(null);
          }}
          className="flex-shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
