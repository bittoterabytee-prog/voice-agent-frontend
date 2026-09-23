import { apiGet, apiPost } from "./apiClient";
import type { SessionEventItem, SessionHistoryItem, SessionSnapshot } from "@/types";

export type StartSessionInput = {
  callerNumber?: string;
  language?: string;
};

export async function startSession(
  input: StartSessionInput = { callerNumber: "browser", language: "en" },
): Promise<SessionSnapshot> {
  return apiPost<SessionSnapshot>("/api/sessions", input);
}

export async function completeSession(callId: string): Promise<SessionSnapshot> {
  return apiPost<SessionSnapshot>(`/api/sessions/${encodeURIComponent(callId)}/complete`);
}

export async function listSessions(limit = 50): Promise<SessionHistoryItem[]> {
  const query = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  const body = await apiGet<{ sessions: SessionHistoryItem[] }>(`/api/sessions${query}`);
  return body.sessions ?? [];
}

export async function listSessionEvents(callId: string): Promise<SessionEventItem[]> {
  const body = await apiGet<{ callId: string; events: SessionEventItem[] }>(
    `/api/sessions/${encodeURIComponent(callId)}/events`,
  );
  return body.events ?? [];
}
