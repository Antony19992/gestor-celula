import { api } from "./api";
import { Member, CreateMemberPayload } from "@/types";

export const membersService = {
  async getAll(): Promise<Member[]> {
    const { data } = await api.get<Member[]>("/member");
    return data;
  },

  async getById(id: number): Promise<Member> {
    const { data } = await api.get<Member>(`/member/${id}`);
    return data;
  },

  async create(payload: CreateMemberPayload): Promise<Member> {
    const { data } = await api.post<Member>("/member", payload);
    return data;
  },

  async update(id: number, payload: CreateMemberPayload): Promise<Member> {
    const { data } = await api.put<Member>(`/member/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/member/${id}`);
  },
};
