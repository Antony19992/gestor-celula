"use client";

import { useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface DrawEvent {
  memberId: number;
  memberName: string;
  timesSelectedInThisMeeting: number;
  meetingId: number;
}

export function useGlobalSSE(onDraw: (event: DrawEvent) => void) {
  const onDrawRef = useRef(onDraw);
  onDrawRef.current = onDraw;

  useEffect(() => {
    let es: EventSource;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const url = `${API_URL}/api/events`;
      console.log("[SSE] conectando em", url);
      es = new EventSource(url);

      es.onopen = () => console.log("[SSE] conectado");

      es.addEventListener("draw", (e) => {
        console.log("[SSE] evento draw recebido:", e.data);
        onDrawRef.current(JSON.parse(e.data) as DrawEvent);
      });

      es.onerror = (err) => {
        console.error("[SSE] erro, reconectando em 5s", err);
        es.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, []);
}
