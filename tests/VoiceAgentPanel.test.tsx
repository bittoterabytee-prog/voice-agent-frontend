import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CallsPage } from "@/pages/CallsPage";
import type { RecordedClip } from "@/services/clipRecorder";
import type { SessionSnapshot, VoiceTurnResponse } from "@/types";

const startRecorder = vi.fn();
const stopAndCollect = vi.fn();
const cancelRecorder = vi.fn();
let levelHandler: ((level: number) => void) | undefined;

const startSessionMock = vi.fn();
const completeSessionMock = vi.fn();
const postVoiceTurnMock = vi.fn();
const playAudioBase64Mock = vi.fn();

vi.mock("@/services/clipRecorder", () => ({
  createClipRecorderSession: vi.fn((handlers: { onLevel?: (level: number) => void }) => {
    levelHandler = handlers.onLevel;
    return {
      start: startRecorder,
      stopAndCollect,
      cancel: cancelRecorder,
      get active() {
        return true;
      },
    };
  }),
}));

vi.mock("@/services/sessionService", () => ({
  startSession: (...args: unknown[]) => startSessionMock(...args),
  completeSession: (...args: unknown[]) => completeSessionMock(...args),
}));

vi.mock("@/services/voiceTurnService", () => ({
  postVoiceTurn: (...args: unknown[]) => postVoiceTurnMock(...args),
}));

vi.mock("@/services/audioPlayback", () => ({
  playAudioBase64: (...args: unknown[]) => playAudioBase64Mock(...args),
}));

const sessionSnapshot: SessionSnapshot = {
  callId: "call-1",
  conversationId: "conv-1",
  callerNumber: "browser",
  language: "en",
  callStatus: "ACTIVE",
  currentState: "ACTIVE_CONVERSATION",
  intent: null,
  turns: [],
  messages: [],
};

const clip: RecordedClip = {
  audioBase64: "AQID",
  mimeType: "audio/webm",
  fileName: "clip.webm",
  byteLength: 3,
};

function renderCallsPage() {
  return render(
    <MemoryRouter initialEntries={["/calls"]}>
      <Routes>
        <Route path="/calls" element={<CallsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("VoiceAgentPanel (KAN-16)", () => {
  beforeEach(() => {
    startRecorder.mockReset();
    stopAndCollect.mockReset();
    cancelRecorder.mockReset();
    startSessionMock.mockReset();
    completeSessionMock.mockReset();
    postVoiceTurnMock.mockReset();
    playAudioBase64Mock.mockReset();
    levelHandler = undefined;

    startRecorder.mockResolvedValue(undefined);
    stopAndCollect.mockResolvedValue(clip);
    startSessionMock.mockResolvedValue(sessionSnapshot);
    completeSessionMock.mockResolvedValue({ ...sessionSnapshot, callStatus: "COMPLETED" });
    playAudioBase64Mock.mockReturnValue({
      stop: vi.fn(),
      ended: Promise.resolve(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TC-001 Idle to listening after Start with mic granted", async () => {
    const user = userEvent.setup();
    renderCallsPage();

    expect(screen.getByTestId("voice-agent")).toBeInTheDocument();
    expect(screen.getByTestId("voice-start")).toBeEnabled();
    expect(screen.getByTestId("voice-send-turn")).toBeDisabled();
    expect(screen.getByTestId("voice-stop")).toBeDisabled();

    await user.click(screen.getByTestId("voice-start"));

    await waitFor(() => {
      expect(startSessionMock).toHaveBeenCalledWith({ callerNumber: "browser", language: "en" });
      expect(startRecorder).toHaveBeenCalled();
      expect(screen.getByTestId("voice-agent").querySelector('[data-voice-state="listening"]')).not.toBeNull();
      expect(screen.getByTestId("voice-call-id")).toHaveTextContent("call-1");
      expect(screen.getByTestId("voice-language")).toHaveTextContent("English (en)");
      expect(screen.getByTestId("voice-send-turn")).toBeEnabled();
    });

    act(() => {
      levelHandler?.(0.5);
    });

    await waitFor(() => {
      expect(screen.getByTestId("voice-level-value")).toHaveTextContent("50%");
    });
  });

  it("TC-002 shows transcript and replyText after a successful turn", async () => {
    const turn: VoiceTurnResponse = {
      transcript: "I need an appointment",
      replyText: "I can help you schedule.",
      conversationId: "conv-1",
      callId: "call-1",
      sessionId: "browser-1",
      audioBase64: "BQQD",
      mimeType: "audio/mpeg",
      requestId: "req-ui-1",
      pipeline: {
        requestId: "req-ui-1",
        stages: [
          { stage: "stt", outcome: "success", durationMs: 120 },
          { stage: "llm", outcome: "success", durationMs: 340 },
          { stage: "tts", outcome: "success", durationMs: 210 },
        ],
      },
    };
    postVoiceTurnMock.mockResolvedValue(turn);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());

    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(postVoiceTurnMock).toHaveBeenCalledWith(
        expect.objectContaining({
          audioBase64: "AQID",
          mimeType: "audio/webm",
          callId: "call-1",
          languageHint: "en",
        }),
      );
      expect(screen.getByTestId("voice-turn-transcript")).toHaveTextContent(
        "I need an appointment",
      );
      expect(screen.getByTestId("voice-turn-reply")).toHaveTextContent("I can help you schedule.");
    });
  });

  it("TC-006 shows pipeline stage logs from the turn response", async () => {
    postVoiceTurnMock.mockResolvedValue({
      transcript: "Hello",
      replyText: "Hi there",
      audioBase64: "BQQD",
      mimeType: "audio/mpeg",
      conversationId: "conv-1",
      callId: "call-1",
      requestId: "req-pipeline",
      pipeline: {
        requestId: "req-pipeline",
        stages: [
          { stage: "stt", outcome: "success", durationMs: 100 },
          { stage: "llm", outcome: "success", durationMs: 200 },
          { stage: "tts", outcome: "success", durationMs: 300 },
        ],
      },
      cost: {
        currency: "USD",
        estimatedUsd: 0.00042,
        breakdown: [
          { stage: "stt", estimatedUsd: 0.0001, details: {} },
          { stage: "llm", estimatedUsd: 0.0002, details: {} },
          { stage: "tts", estimatedUsd: 0.00012, details: {} },
        ],
        note: "Estimated from public OpenAI list prices for this POC; not a live wallet balance.",
      },
    } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    expect(screen.getByTestId("voice-pipeline-empty")).toBeInTheDocument();
    expect(screen.getByTestId("voice-session-cost")).toHaveTextContent("$0.0000");

    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-pipeline-request-id")).toHaveTextContent(
        "requestId: req-pipeline",
      );
      const stages = screen.getAllByTestId("voice-pipeline-stage");
      expect(stages).toHaveLength(3);
      expect(stages[0]).toHaveTextContent(/STT · success · 100ms/i);
      expect(stages[1]).toHaveTextContent(/LLM · success · 200ms/i);
      expect(stages[2]).toHaveTextContent(/TTS · success · 300ms/i);
      expect(screen.getByTestId("voice-turn-cost")).toHaveTextContent(/Last turn est\. \$0\.0004/);
      expect(screen.getByTestId("voice-session-cost")).toHaveTextContent("$0.0004");
      expect(screen.getByTestId("voice-turn-cost-line")).toHaveTextContent("$0.0004");
    });
  });

  it("TC-003 plays TTS audio when audioBase64 is returned", async () => {
    postVoiceTurnMock.mockResolvedValue({
      transcript: "Hello",
      replyText: "Hi there",
      audioBase64: "BQQD",
      mimeType: "audio/mpeg",
      conversationId: "conv-1",
      callId: "call-1",
    } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(playAudioBase64Mock).toHaveBeenCalledWith("BQQD", "audio/mpeg");
    });
  });

  it("TC-004 shows text reply and notice when ttsError is present", async () => {
    postVoiceTurnMock.mockResolvedValue({
      transcript: "Hello",
      replyText: "Hi there",
      conversationId: "conv-1",
      callId: "call-1",
      ttsError: {
        code: "EXTERNAL_SERVICE_UNAVAILABLE",
        message: "TTS provider unavailable",
        service: "tts",
      },
    } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-turn-reply")).toHaveTextContent("Hi there");
      expect(screen.getByTestId("voice-tts-notice")).toHaveTextContent("Audio playback unavailable");
      expect(playAudioBase64Mock).not.toHaveBeenCalled();
    });
  });

  it("TC-005 shows a user-safe error on hard backend failure", async () => {
    const { ApiError } = await import("@/services/apiClient");
    postVoiceTurnMock.mockRejectedValue(
      new ApiError("Speech service is unavailable.", 502, "EXTERNAL_SERVICE_UNAVAILABLE"),
    );

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-agent").querySelector('[data-voice-state="error"]')).not.toBeNull();
      expect(screen.getByTestId("voice-agent-message")).toHaveTextContent(
        "Speech service is unavailable.",
      );
      expect(screen.getByTestId("voice-error-code")).toHaveTextContent(
        "EXTERNAL_SERVICE_UNAVAILABLE",
      );
      expect(screen.getByTestId("voice-stop")).toBeEnabled();
    });
  });

  it("TC-006 Stop returns to idle, releases capture, and completes the session", async () => {
    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-call-id")).toHaveTextContent("call-1"));

    await user.click(screen.getByTestId("voice-stop"));

    await waitFor(() => {
      expect(cancelRecorder).toHaveBeenCalled();
      expect(completeSessionMock).toHaveBeenCalledWith("call-1");
      expect(screen.getByTestId("voice-agent").querySelector('[data-voice-state="idle"]')).not.toBeNull();
      expect(screen.getByTestId("voice-agent-message")).toHaveTextContent("Session stopped");
      expect(screen.getByTestId("voice-start")).toBeEnabled();
      expect(screen.getByTestId("voice-stop")).toBeDisabled();
    });
  });
});

describe("VoiceAgentPanel multilingual language indicator (KAN-29)", () => {
  beforeEach(() => {
    startRecorder.mockReset();
    stopAndCollect.mockReset();
    cancelRecorder.mockReset();
    startSessionMock.mockReset();
    completeSessionMock.mockReset();
    postVoiceTurnMock.mockReset();
    playAudioBase64Mock.mockReset();
    levelHandler = undefined;

    startRecorder.mockResolvedValue(undefined);
    stopAndCollect.mockResolvedValue(clip);
    startSessionMock.mockResolvedValue(sessionSnapshot);
    completeSessionMock.mockResolvedValue({ ...sessionSnapshot, callStatus: "COMPLETED" });
    playAudioBase64Mock.mockReturnValue({
      stop: vi.fn(),
      ended: Promise.resolve(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TC-003 English baseline shows en after Start", async () => {
    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => {
      expect(screen.getByTestId("voice-language")).toHaveTextContent("English (en)");
    });
  });

  it("TC-001 shows Hindi when the turn returns language=hi", async () => {
    postVoiceTurnMock.mockResolvedValue({
      transcript: "Namaste",
      replyText: "Main madad karunga.",
      language: "hi",
      languageChanged: true,
      languageDetection: {
        language: "hi",
        confidence: 0.9,
        unclear: false,
        unsupported: false,
      },
      conversationId: "conv-1",
      callId: "call-1",
      audioBase64: "BQQD",
      mimeType: "audio/mpeg",
    } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-language")).toHaveTextContent("Hindi (hi)");
      expect(screen.getByTestId("voice-language-notice")).toHaveTextContent(/switched to Hindi/i);
      expect(screen.getByTestId("voice-turn-reply")).toHaveTextContent("Main madad karunga.");
    });
  });

  it("TC-002 updates the indicator after a mid-call language switch", async () => {
    postVoiceTurnMock
      .mockResolvedValueOnce({
        transcript: "Hello",
        replyText: "Hi",
        language: "en",
        languageChanged: false,
        conversationId: "conv-1",
        callId: "call-1",
        audioBase64: "BQQD",
        mimeType: "audio/mpeg",
      } satisfies VoiceTurnResponse)
      .mockResolvedValueOnce({
        transcript: "Namaste",
        replyText: "Theek hai",
        language: "hi",
        languageChanged: true,
        conversationId: "conv-1",
        callId: "call-1",
        audioBase64: "BQQD",
        mimeType: "audio/mpeg",
      } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());

    await user.click(screen.getByTestId("voice-send-turn"));
    await waitFor(() => {
      expect(screen.getByTestId("voice-language")).toHaveTextContent("English (en)");
    });

    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-language")).toHaveTextContent("Hindi (hi)");
      expect(screen.getByTestId("voice-language-notice")).toHaveTextContent(/Language switched/i);
      expect(screen.getAllByTestId("voice-turn")).toHaveLength(2);
    });
  });

  it("KAN-31 shows Hinglish when the turn returns language=hinglish", async () => {
    postVoiceTurnMock.mockResolvedValue({
      transcript: "Mujhe appointment chahiye tomorrow",
      replyText: "Theek hai, main help karunga.",
      language: "hinglish",
      languageChanged: true,
      conversationId: "conv-1",
      callId: "call-1",
      audioBase64: "BQQD",
      mimeType: "audio/mpeg",
    } satisfies VoiceTurnResponse);

    const user = userEvent.setup();
    renderCallsPage();
    await user.click(screen.getByTestId("voice-start"));
    await waitFor(() => expect(screen.getByTestId("voice-send-turn")).toBeEnabled());
    await user.click(screen.getByTestId("voice-send-turn"));

    await waitFor(() => {
      expect(screen.getByTestId("voice-language")).toHaveTextContent("Hinglish");
      expect(screen.getByTestId("voice-language-notice")).toHaveTextContent(/Hinglish/i);
    });
  });
});
