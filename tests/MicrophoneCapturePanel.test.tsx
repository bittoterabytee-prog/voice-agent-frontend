import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CallsPage } from "@/pages/CallsPage";
import type { AudioChunk } from "@/services/audioCapture";

const startMock = vi.fn();
const stopMock = vi.fn();
let chunkHandler: ((chunk: AudioChunk) => void) | undefined;
let levelHandler: ((level: number) => void) | undefined;

vi.mock("@/services/audioCapture", async () => {
  const actual = await vi.importActual<typeof import("@/services/audioCapture")>(
    "@/services/audioCapture",
  );

  return {
    ...actual,
    createAudioCaptureSession: vi.fn((handlers: {
      onChunk?: (chunk: AudioChunk) => void;
      onLevel?: (level: number) => void;
    }) => {
      chunkHandler = handlers.onChunk;
      levelHandler = handlers.onLevel;
      return {
        start: startMock,
        stop: stopMock,
        get active() {
          return true;
        },
      };
    }),
  };
});

function renderCallsPage() {
  return render(
    <MemoryRouter initialEntries={["/calls"]}>
      <Routes>
        <Route path="/calls" element={<CallsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("MicrophoneCapturePanel", () => {
  beforeEach(() => {
    startMock.mockReset();
    stopMock.mockReset();
    startMock.mockResolvedValue(undefined);
    chunkHandler = undefined;
    levelHandler = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows idle controls on the Calls page", () => {
    renderCallsPage();

    expect(screen.getByTestId("mic-capture")).toBeInTheDocument();
    expect(screen.getByTestId("mic-capture-message")).toHaveTextContent("Microphone is idle");
    expect(screen.getByTestId("mic-start")).toBeEnabled();
    expect(screen.getByTestId("mic-stop")).toBeDisabled();
  });

  it("TC-001 activates capture and shows chunk activity after Start", async () => {
    const user = userEvent.setup();
    renderCallsPage();

    await user.click(screen.getByTestId("mic-start"));

    await waitFor(() => {
      expect(startMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      chunkHandler?.({
        samples: Float32Array.from([0.25, -0.1]),
        sampleRate: 48_000,
        channelCount: 1,
        format: "pcm_f32le",
        sequence: 0,
        timestampMs: 10,
      });
      levelHandler?.(0.4);
    });

    await waitFor(() => {
      expect(screen.getByTestId("mic-capture-message")).toHaveTextContent("active");
      expect(screen.getByTestId("mic-chunk-count")).toHaveTextContent("1");
      expect(screen.getByTestId("mic-level-value")).toHaveTextContent("40%");
      expect(screen.getByTestId("mic-last-chunk")).toHaveTextContent("pcm_f32le");
    });
  });

  it("TC-002 shows a clear error when permission is denied", async () => {
    const { AudioCaptureError } = await import("@/services/audioCapture");
    startMock.mockRejectedValueOnce(
      new AudioCaptureError(
        "permission_denied",
        "Microphone permission was denied. Allow mic access in the browser and try again.",
      ),
    );

    const user = userEvent.setup();
    renderCallsPage();

    await user.click(screen.getByTestId("mic-start"));

    await waitFor(() => {
      expect(screen.getByTestId("mic-capture-message")).toHaveTextContent("permission was denied");
      expect(screen.getByTestId("mic-error-code")).toHaveTextContent("permission_denied");
    });
  });

  it("TC-003 Stop releases capture and returns to idle", async () => {
    const user = userEvent.setup();
    renderCallsPage();

    await user.click(screen.getByTestId("mic-start"));
    await waitFor(() => expect(startMock).toHaveBeenCalled());

    await user.click(screen.getByTestId("mic-stop"));

    expect(stopMock).toHaveBeenCalled();
    expect(screen.getByTestId("mic-capture-message")).toHaveTextContent("Capture stopped");
    expect(screen.getByTestId("mic-level-value")).toHaveTextContent("0%");
  });

  it("TC-004 shows a meaningful error when no device is available", async () => {
    const { AudioCaptureError } = await import("@/services/audioCapture");
    startMock.mockRejectedValueOnce(
      new AudioCaptureError(
        "no_device",
        "No microphone was found. Connect an input device and try again.",
      ),
    );

    const user = userEvent.setup();
    renderCallsPage();

    await user.click(screen.getByTestId("mic-start"));

    await waitFor(() => {
      expect(screen.getByTestId("mic-capture-message")).toHaveTextContent("No microphone was found");
      expect(screen.getByTestId("mic-error-code")).toHaveTextContent("no_device");
    });
  });
});
