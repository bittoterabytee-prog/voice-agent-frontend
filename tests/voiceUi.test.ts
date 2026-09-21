import { describe, expect, it } from "vitest";
import { conversationStateToVoiceUi, formatConversationState } from "@/utils/voiceUi";

describe("voiceUi helpers (KAN-19)", () => {
  it("maps speaking / listening / error / idle conversation states", () => {
    expect(conversationStateToVoiceUi("AGENT_SPEAKING")).toBe("speaking");
    expect(conversationStateToVoiceUi("USER_SPEAKING")).toBe("listening");
    expect(conversationStateToVoiceUi("WAITING_FOR_USER")).toBe("idle");
    expect(conversationStateToVoiceUi("ERROR_RECOVERY")).toBe("error");
  });

  it("formats conversation state labels for the monitor", () => {
    expect(formatConversationState("WAITING_FOR_USER")).toBe("WAITING FOR USER");
  });
});
