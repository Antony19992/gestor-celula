"use client";

import { useState, useEffect, useCallback } from "react";
import { Meeting, MeetingDetail, DrawResult, ApiError } from "@/types";
import { meetingsService } from "@/services/meetings";

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingsService.getAll();
      setMeetings(data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refetch: fetchMeetings };
}

export function useMeeting(id: number) {
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [drawing, setDrawing] = useState(false);

  const fetchMeeting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingsService.getById(id);
      setMeeting(data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchMeeting();
  }, [id, fetchMeeting]);

  const drawMember = useCallback(async () => {
    setDrawing(true);
    setDrawResult(null);
    try {
      const result = await meetingsService.drawMember(id);
      setDrawResult(result);
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
