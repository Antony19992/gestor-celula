import { api } from "./api";
import { Study } from "@/types";

export interface CreateStudyPayload {
  title: string;
  verse: string;
  introduction: string;
  explanation: string;
  questions: string[];
  applicationIndividual: string;
  applicationGroup: string;
  prayerTopics: string[];
  conclusion: string;
}

export const studyService = {
  async getAll(): Promise<Study[]> {
    const { data } = await api.get<Study[]>("/study");
    return data;
  },

  async getById(id: number): Promise<Study> {
    const { data } = await api.get<Study>(`/study/${id}`);
    return data;
  },

  async create(payload: CreateStudyPayload): Promise<Study> {
    const { data } = await api.post<Study>("/study", payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/study/${id}`);
  },
};
