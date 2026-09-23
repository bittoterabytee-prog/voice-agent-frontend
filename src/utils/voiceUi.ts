import type { ConversationState, VoiceUiState } from "@/types";

/** Map SRD conversation state → browser voice chrome (listening / speaking / idle / error). */
export function conversationStateToVoiceUi(state: ConversationState): VoiceUiState {
  switch (state) {
    case "AGENT_SPEAKING":
      return "speaking";
    case "USER_SPEAKING":
    case "INTERRUPTED":
    case "USER_RETURNED":
    case "ACTIVE_CONVERSATION":
    case "CONFIRMATION_REQUIRED":
      return "listening";
    case "ERROR_RECOVERY":
      return "error";
    case "CHECKING_AVAILABILITY":
    case "TOOL_EXECUTION":
      return "processing";
    case "USER_REQUESTED_WAIT":
    case "WAITING_FOR_USER":
    case "BACKGROUND_SPEECH":
    case "HUMAN_HANDOFF":
    case "CALL_ENDING":
    case "IDLE":
    default:
      return "idle";
  }
}

export function formatConversationState(state: ConversationState): string {
  return state.replaceAll("_", " ");
}

export const VOICE_UI_STATE_COPY: Record<VoiceUiState, { title: string; description: string }> = {
  idle: {
    title: "Idle / waiting",
    description: "Agent is quiet — hold, background speech, or between turns.",
  },
  listening: {
    title: "Listening",
    description: "Capturing caller speech or awaiting the next utterance.",
  },
  processing: {
    title: "Processing",
    description: "Sending audio to the backend turn pipeline (STT → LLM → TTS).",
  },
  speaking: {
    title: "Speaking",
    description: "Agent TTS is playing; barge-in can interrupt.",
  },
  error: {
    title: "Error",
    description: "Recovery path — API failure, STT/TTS issue, or escalation.",
  },
};
