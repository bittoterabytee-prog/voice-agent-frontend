import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CallHistoryPage } from "@/pages/CallHistoryPage";
import type { SessionEventItem, SessionHistoryItem } from "@/types";

const listSessionsMock = vi.fn();
const listSessionEventsMock = vi.fn();

vi.mock("@/services/sessionService", () => ({
  listSessions: (...args: unknown[]) => listSessionsMock(...args),
  listSessionEvents: (...args: unknown[]) => listSessionEventsMock(...args),
}));

const sessions: SessionHistoryItem[] = [
  {
    callId: "call-history-1",
    callerNumber: "browser",
    language: "en",
    callStatus: "COMPLETED",
    currentState: "CALL_COMPLETED",
    intent: null,
    startTime: "2026-09-23T05:00:00.000Z",
    endTime: "2026-09-23T05:05:00.000Z",
    durationMs: 300_000,
    estimatedUsd: 0.0012,
  },
];

const events: SessionEventItem[] = [
  {
    id: "evt-1",
    callId: "call-history-1",
    eventType: "CALL_STARTED",
    timestamp: "2026-09-23T05:00:00.000Z",
    metadata: {},
  },
  {
    id: "evt-2",
    callId: "call-history-1",
    eventType: "TOOL_FAILED",
    timestamp: "2026-09-23T05:01:00.000Z",
    metadata: {
      kind: "voice_pipeline",
      stage: "tts",
      softFail: true,
      code: "EXTERNAL_SERVICE_UNAVAILABLE",
      message: "TTS soft fail",
    },
  },
];

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={["/history"]}>
      <Routes>
        <Route path="/history" element={<CallHistoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CallHistoryPage (KAN-18 session logs)", () => {
  beforeEach(() => {
    listSessionsMock.mockReset();
    listSessionEventsMock.mockReset();
    listSessionsMock.mockResolvedValue(sessions);
    listSessionEventsMock.mockResolvedValue(events);
  });

  it("loads live sessions and shows call_events including pipeline failures", async () => {
    const user = userEvent.setup();
    renderHistory();

    await waitFor(() => {
      expect(listSessionsMock).toHaveBeenCalled();
      expect(screen.getByTestId("history-sessions-table")).toBeInTheDocument();
      expect(screen.getByTestId("history-session-cost")).toHaveTextContent("$0.0012");
    });

    await user.click(screen.getByTestId("history-session-row"));

    await waitFor(() => {
      expect(listSessionEventsMock).toHaveBeenCalledWith("call-history-1");
      expect(screen.getByTestId("history-session-logs")).toBeInTheDocument();
      expect(screen.getByTestId("history-pipeline-failure")).toHaveTextContent(/TTS/i);
      expect(screen.getAllByTestId("history-event-row").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByTestId("history-selected-call")).toHaveTextContent("$0.0012");
    });
  });
});
