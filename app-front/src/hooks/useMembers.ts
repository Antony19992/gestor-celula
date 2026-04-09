"use client";

import { useState, useEffect, useCallback } from "react";
import { Member, CreateMemberPayload, ApiError } from "@/types";
import { membersService } from "@/services/members";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = useCallback(
    async (payload: CreateMemberPayload): Promise<Member | null> => {
      try {
        const newMember = await membersService.create(payload);
        setMembers((prev) => [...prev, newMember]);
        return newMember;
      } catch (err) {
        setError((err as ApiError).message);
        return null;
      }
    },
    []
  );

  const deleteMember = useCallback(async (id: number) => {
    try {
      await membersService.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError((err as ApiError).message);
    }
  }, []);

  return {
    members,
    loading,
    error,
    createMember,
    deleteMember,
    refetch: fetchMembers,
  };
}
