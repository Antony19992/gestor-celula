"use client";

import { useState, useEffect, useCallback } from "react";
import { Meeting, MeetingDetail, DrawResult, ApiError } from "@/types";
import { meetingsService } from "@/services/meetings";
import { localCache } from "@/lib/local-cache";

const MEETINGS_KEY = "meetings";
const MEETINGS_TTL = 5 * 60 * 1000; // 5 minutos

const meetingKey = (id: number) => `meeting-${id}`;
const MEETING_TTL = 2 * 60 * 1000; // 2 minutos

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await meetingsService.getAll();
      localCache.set(MEETINGS_KEY, data);
      setMeetings(data);
    } catch (err) {
      if (!silent) setError((err as ApiError).message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localCache.get<Meeting[]>(MEETINGS_KEY);
    if (cached) {
      setMeetings(cached.data);
      setLoading(false);
      if (localCache.isStale(cached, MEETINGS_TTL)) {
        fetchMeetings(true);
      }
    } else {
      fetchMeetings();
    }
  }, [fetchMeetings]);

  return { meetings, loading, error, refetch: fetchMeetings };
}

export function useMeeting(id: number) {
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [drawing, setDrawing] = useState(false);

  const fetchMeeting = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await meetingsService.getById(id);
      localCache.set(meetingKey(id), data);
      setMeeting(data);
    } catch (err) {
      if (!silent) setError((err as ApiError).message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const cached = localCache.get<MeetingDetail>(meetingKey(id));
    if (cached) {
      setMeeting(cached.data);
      setLoading(false);
      if (localCache.isStale(cached, MEETING_TTL)) {
        fetchMeeting(true);
      }
    } else {
      fetchMeeting();
    }
  }, [id, fetchMeeting]);

  const drawMember = useCallback(async () => {
    setDrawing(true);
    setDrawResult(null);
    try {
      const result = await meetingsService.drawMember(id);
      setDrawResult(result);
      // Invalida cache da reunião pois pode ter nova participação
      localCache.delete(meetingKey(id));
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setDrawing(false);
    }
  }, [id]);

  const clearDraw = useCallback(() => setDrawResult(null), []);

  return {
    meeting,
    loading,
    error,
    drawResult,
    drawing,
    drawMember,
    clearDraw,
    refetch: fetchMeeting,
  };
}
