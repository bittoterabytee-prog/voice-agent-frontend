export type HealthStatus = "ok" | "degraded" | "unknown";

export interface HealthResponse {
  status: string;
}

export type SystemConnectionState = "idle" | "loading" | "healthy" | "error";

export interface SystemStatus {
  state: SystemConnectionState;
  message: string;
  checkedAt: string | null;
  apiBaseUrl: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export type MicrophoneCaptureState = "idle" | "starting" | "capturing" | "error";

export type MicrophoneErrorCode =
  | "permission_denied"
  | "no_device"
  | "device_in_use"
  | "unsupported"
  | "unknown";

export interface MicrophoneChunkSummary {
  sequence: number;
  sampleRate: number;
  sampleCount: number;
  format: "pcm_f32le";
  timestampMs: number;
}

export interface MicrophoneCaptureStatus {
  state: MicrophoneCaptureState;
  message: string;
  /** Peak input level in [0, 1]. */
  level: number;
  chunkCount: number;
  lastChunk: MicrophoneChunkSummary | null;
  errorCode: MicrophoneErrorCode | null;
}

/** SRD §24 conversation states surfaced in the live monitor (KAN-19). */
export type ConversationState =
  | "ACTIVE_CONVERSATION"
  | "AGENT_SPEAKING"
  | "USER_SPEAKING"
  | "INTERRUPTED"
  | "USER_REQUESTED_WAIT"
  | "WAITING_FOR_USER"
  | "BACKGROUND_SPEECH"
  | "USER_RETURNED"
  | "CHECKING_AVAILABILITY"
  | "CONFIRMATION_REQUIRED"
  | "TOOL_EXECUTION"
  | "HUMAN_HANDOFF"
  | "ERROR_RECOVERY"
  | "CALL_ENDING"
  | "IDLE";

/** Browser-facing voice chrome states (KAN-19 TC-002). */
export type VoiceUiState = "idle" | "listening" | "speaking" | "error";

export type CallConnectionStatus = "idle" | "ringing" | "connected" | "ended" | "failed";

export type AgentLanguage = "English" | "Hindi" | "Hinglish";

export interface CallActivityEvent {
  id: string;
  time: string;
  label: string;
  kind: "info" | "state" | "tool" | "wait" | "error" | "handoff";
}

export interface LiveCallSnapshot {
  callId: string;
  status: CallConnectionStatus;
  language: AgentLanguage;
  conversationState: ConversationState;
  intent: string;
  waiting: boolean;
  toolActivity: string | null;
  appointmentResult: string | null;
  handoffStatus: "none" | "requested" | "connected";
  durationLabel: string;
  errorMessage: string | null;
  activity: CallActivityEvent[];
}

export interface RecentCallSummary {
  id: string;
  caller: string;
  language: AgentLanguage;
  intent: string;
  outcome: string;
  durationLabel: string;
  endedAt: string;
  stateAtEnd: ConversationState;
}
