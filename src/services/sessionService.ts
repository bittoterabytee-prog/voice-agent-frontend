import { apiPost } from "./apiClient";
import type { SessionSnapshot } from "@/types";

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
