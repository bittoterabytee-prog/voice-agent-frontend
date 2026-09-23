import { apiPost } from "./apiClient";
import type { VoiceTurnRequest, VoiceTurnResponse } from "@/types";

export async function postVoiceTurn(request: VoiceTurnRequest): Promise<VoiceTurnResponse> {
  return apiPost<VoiceTurnResponse>("/api/voice/turn", request);
}
