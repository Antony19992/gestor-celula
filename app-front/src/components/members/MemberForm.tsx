"use client";

import { useState, FormEvent } from "react";
import { CreateMemberPayload } from "@/types";
import { Button } from "@/components/ui/Button";

interface MemberFormProps {
  onSubmit: (payload: CreateMemberPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function MemberForm({ onSubmit, loading, error }: MemberFormProps) {
  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ name: name.trim() });
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} fullWidth>
        Cadastrar membro
      </Button>
    </form>
  );
}
