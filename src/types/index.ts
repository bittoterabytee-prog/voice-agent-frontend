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

export type PipelineStageSummary = {
  stage: "stt" | "language" | "llm" | "tts" | "session" | "turn";
  outcome: "success" | "failure";
  durationMs: number;
  softFail?: boolean;
  code?: string;
};

export type PipelineTrace = {
  requestId: string;
  stages: PipelineStageSummary[];
};

export type LanguageDetectionResult = {
  language: "en" | "hi" | "hinglish" | null;
  confidence: number;
  unclear: boolean;
  unsupported: boolean;
};

export type VoiceTurnRequest = {
  audioBase64: string;
  mimeType?: string;
  fileName?: string;
  sessionId?: string;
  conversationId?: string;
  callId?: string;
  voice?: string;
  /** Optional STT / detection hint (en | hi | hinglish). */
  languageHint?: string;
};

export type VoiceTurnResponse = {
  transcript: string;
  replyText: string;
  conversationId?: string;
  sessionId?: string;
  callId?: string;
  requestId?: string;
  currentState?: string;
  action?: "continue" | "waited" | "resumed";
  audioBase64?: string;
  mimeType?: string;
  ttsError?: VoiceTurnTtsError;
  pipeline?: PipelineTrace;
  cost?: TurnCostEstimate;
  /** Durable session language preference (KAN-28 / KAN-29). */
  language?: string;
  /** True when this turn changed session language (KAN-27 / KAN-29). */
  languageChanged?: boolean;
  languageDetection?: LanguageDetectionResult;
};

export type StageUsageEstimate = {
  stage: "stt" | "llm" | "tts";
  estimatedUsd: number;
  details: Record<string, number | string>;
};

export type TurnCostEstimate = {
  currency: "USD";
  estimatedUsd: number;
  breakdown: StageUsageEstimate[];
  note: string;
};

export type SpendSummary = {
  currency: "USD";
  estimatedUsdTotal: number;
  turnCount: number;
  callCount: number;
  note: string;
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

export type SessionHistoryItem = {
  callId: string;
  callerNumber: string;
  language: string;
  callStatus: string;
  currentState: string | null;
  intent: string | null;
  startTime: string;
  endTime: string | null;
  durationMs: number;
  estimatedUsd: number;
};

export type SessionEventItem = {
  id: string;
  callId: string;
  eventType: string;
  timestamp: string;
  metadata: Record<string, unknown>;
};

export type VoiceConversationTurn = {
  id: string;
  transcript: string;
  replyText: string;
  ttsNotice: string | null;
  pipeline: PipelineTrace | null;
  cost: TurnCostEstimate | null;
};

export type VoiceAgentPhase = VoiceUiState;

export type VoiceAgentStatus = {
  phase: VoiceAgentPhase;
  message: string;
  level: number;
  callId: string | null;
  conversationId: string | null;
  sessionId: string | null;
  /** Active session language from API (en | hi | hinglish) — KAN-29. */
  language: string | null;
  /** Brief notice when languageChanged or unclear/unsupported (KAN-29). */
  languageNotice: string | null;
  turns: VoiceConversationTurn[];
  lastPipeline: PipelineTrace | null;
  lastCost: TurnCostEstimate | null;
  sessionEstimatedUsd: number;
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
