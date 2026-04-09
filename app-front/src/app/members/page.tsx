"use client";

import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { MemberForm } from "@/components/members/MemberForm";
import { MemberList } from "@/components/members/MemberList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CreateMemberPayload } from "@/types";

export default function MembersPage() {
  const { members, loading, error, createMember, deleteMember, refetch } =
    useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(payload: CreateMemberPayload) {
    setCreating(true);
    setFormError(null);
    const result = await createMember(payload);
    setCreating(false);
    if (result) {
      setIsModalOpen(false);
    } else {
      setFormError("Erro ao cadastrar membro. Tente novamente.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header sempre visível */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-gray-500">
              {members.length} membro{members.length !== 1 ? "s" : ""} cadastrado
              {members.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo membro
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      <Card padding="none">
        <div className="px-4 py-4 sm:px-5">
          {loading ? (
            <div className="space-y-3 py-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <MemberList members={members} onDelete={deleteMember} />
          )}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
        }}
        title="Novo membro"
      >
        <MemberForm
          onSubmit={handleCreate}
          loading={creating}
          error={formError}
        />
      </Modal>
    </div>
  );
}
