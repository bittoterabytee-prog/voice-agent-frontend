import { describe, expect, it } from "vitest";
import {
  conversationStateToVoiceUi,
  formatConversationState,
  formatSessionLanguage,
} from "@/utils/voiceUi";

describe("voiceUi helpers (KAN-19)", () => {
  it("maps speaking / listening / processing / error / idle conversation states", () => {
    expect(conversationStateToVoiceUi("AGENT_SPEAKING")).toBe("speaking");
    expect(conversationStateToVoiceUi("USER_SPEAKING")).toBe("listening");
    expect(conversationStateToVoiceUi("CHECKING_AVAILABILITY")).toBe("processing");
    expect(conversationStateToVoiceUi("WAITING_FOR_USER")).toBe("idle");
    expect(conversationStateToVoiceUi("ERROR_RECOVERY")).toBe("error");
  });

  it("formats conversation state labels for the monitor", () => {
    expect(formatConversationState("WAITING_FOR_USER")).toBe("WAITING FOR USER");
  });
});

describe("formatSessionLanguage (KAN-29)", () => {
  it("labels en / hi / hinglish for the voice UI indicator", () => {
    expect(formatSessionLanguage("en")).toBe("English (en)");
    expect(formatSessionLanguage("hi")).toBe("Hindi (hi)");
    expect(formatSessionLanguage("hinglish")).toBe("Hinglish");
    expect(formatSessionLanguage(null)).toBe("—");
  });
});
