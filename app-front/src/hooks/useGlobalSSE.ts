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
      es = new EventSource(`${API_URL}/api/events`);

      es.addEventListener("draw", (e) => {
        onDrawRef.current(JSON.parse(e.data) as DrawEvent);
      });

      es.onerror = () => {
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
