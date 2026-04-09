// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Member {
  id: number;
  name: string;
}

export interface Study {
  id: number;
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

export interface Participation {
  memberId: number;
  memberName: string;
  timesSelected: number;
  timesSpoken: number;
}

/** Retorno do GET /api/meeting (lista) */
export interface Meeting {
  id: number;
  date: string;
  studyId: number;
  studyTitle: string;
  lastDrawnMemberId: number | null;
}

/** Retorno do GET /api/meeting/{id} (detalhe) */
export interface MeetingDetail extends Meeting {
  participations: Participation[];
}

/** Retorno do POST /api/meeting/{id}/draw-member */
export interface DrawResult {
  memberId: number;
  memberName: string;
  timesSelectedInThisMeeting: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateMeetingPayload {
  date: string;
  studyId: number;
}

export interface CreateMemberPayload {
  name: string;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
}
