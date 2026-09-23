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

/** Browser-facing voice chrome states (KAN-16 / KAN-19). */
export type VoiceUiState = "idle" | "listening" | "processing" | "speaking" | "error";

export type VoiceTurnTtsError = {
  code: string;
  message: string;
  service: string;
};

export type VoiceTurnRequest = {
  audioBase64: string;
  mimeType?: string;
  fileName?: string;
  sessionId?: string;
  conversationId?: string;
  callId?: string;
  voice?: string;
};

export type VoiceTurnResponse = {
  transcript: string;
  replyText: string;
  conversationId?: string;
  sessionId?: string;
  callId?: string;
  currentState?: string;
  action?: "continue" | "waited" | "resumed";
  audioBase64?: string;
  mimeType?: string;
  ttsError?: VoiceTurnTtsError;
};

export type SessionSnapshot = {
  callId: string;
  conversationId: string;
  callerNumber: string;
  language: string;
  callStatus: string;
  currentState: string;
  intent: string | null;
  turns: unknown[];
  messages: unknown[];
};

export type VoiceConversationTurn = {
  id: string;
  transcript: string;
  replyText: string;
  ttsNotice: string | null;
};

export type VoiceAgentPhase = VoiceUiState;

export type VoiceAgentStatus = {
  phase: VoiceAgentPhase;
  message: string;
  level: number;
  callId: string | null;
  conversationId: string | null;
  sessionId: string | null;
  turns: VoiceConversationTurn[];
  errorCode: string | null;
};

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
