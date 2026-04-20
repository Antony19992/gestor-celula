"use client";

import { useState, useEffect, useCallback } from "react";
import { Member, CreateMemberPayload, ApiError } from "@/types";
import { membersService } from "@/services/members";
import { localCache } from "@/lib/local-cache";

const CACHE_KEY = "members";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await membersService.getAll();
      localCache.set(CACHE_KEY, data);
      setMembers(data);
    } catch (err) {
      if (!silent) setError((err as ApiError).message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localCache.get<Member[]>(CACHE_KEY);
    if (cached) {
      setMembers(cached.data);
      setLoading(false);
      // Só vai ao servidor se o cache estiver velho
      if (localCache.isStale(cached, CACHE_TTL)) {
        fetchMembers(true);
      }
    } else {
      fetchMembers();
    }
  }, [fetchMembers]);

  const createMember = useCallback(
    async (payload: CreateMemberPayload): Promise<Member | null> => {
      try {
        const newMember = await membersService.create(payload);
        setMembers((prev) => {
          const updated = [...prev, newMember];
          localCache.set(CACHE_KEY, updated);
          return updated;
        });
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
      setMembers((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        localCache.set(CACHE_KEY, updated);
        return updated;
      });
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
