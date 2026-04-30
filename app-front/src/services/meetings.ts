import { api } from "./api";
import { Meeting, MeetingDetail, CreateMeetingPayload, DrawResult } from "@/types";

export const meetingsService = {
  async getAll(): Promise<Meeting[]> {
    const { data } = await api.get<Meeting[]>("/meeting");
    return data;
  },

  async getById(id: number): Promise<MeetingDetail> {
    const { data } = await api.get<MeetingDetail>(`/meeting/${id}`);
    return data;
  },

  async create(payload: CreateMeetingPayload): Promise<Meeting> {
    const { data } = await api.post<Meeting>("/meeting", payload);
    return data;
  },

  async drawMember(id: number, questionText?: string, questionOrder?: number): Promise<DrawResult> {
    const { data } = await api.post<DrawResult>(`/meeting/${id}/draw-member`, { questionText, questionOrder });
    return data;
  },
};
