import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AudioCaptureError,
  createAudioCaptureSession,
  mapMediaError,
} from "@/services/audioCapture";

type FakeTrack = {
  stop: ReturnType<typeof vi.fn>;
};

function createFakeAudioGraph() {
  const tracks: FakeTrack[] = [{ stop: vi.fn() }];
  const stream = {
    getTracks: () => tracks,
  } as unknown as MediaStream;

  let processHandler: ((event: { inputBuffer: AudioBuffer }) => void) | null = null;

  const inputBuffer = {
    numberOfChannels: 1,
    length: 4,
    sampleRate: 48_000,
    getChannelData: () => Float32Array.from([0.1, -0.2, 0.5, 0]),
  } as unknown as AudioBuffer;

  const processor = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    set onaudioprocess(handler: ((event: { inputBuffer: AudioBuffer }) => void) | null) {
      processHandler = handler;
    },
    get onaudioprocess() {
      return processHandler;
    },
  };

  const source = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const audioContext = {
    state: "running" as AudioContextState,
    sampleRate: 48_000,
    destination: {} as AudioDestinationNode,
    resume: vi.fn(async () => undefined),
    close: vi.fn(async () => undefined),
    createMediaStreamSource: vi.fn(() => source),
    createScriptProcessor: vi.fn(() => processor),
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };

  return { stream, tracks, processor, source, audioContext, inputBuffer, getProcessHandler: () => processHandler };
}

describe("mapMediaError", () => {
  it("maps permission denial", () => {
    const error = mapMediaError(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
    expect(error).toBeInstanceOf(AudioCaptureError);
    expect(error.code).toBe("permission_denied");
  });

  it("maps missing device", () => {
    const error = mapMediaError(Object.assign(new Error("missing"), { name: "NotFoundError" }));
    expect(error.code).toBe("no_device");
  });
});

describe("createAudioCaptureSession", () => {
  const graph = createFakeAudioGraph();

  beforeEach(() => {
    Object.assign(graph, createFakeAudioGraph());

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(async () => graph.stream),
      },
    });

    vi.stubGlobal("AudioContext", vi.fn(function AudioContextMock() {
      return graph.audioContext;
    }));

    vi.stubGlobal("performance", { now: () => 1234 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TC-001 starts capture and produces chunks when permission is granted", async () => {
    const onChunk = vi.fn();
    const onLevel = vi.fn();
    const session = createAudioCaptureSession({ onChunk, onLevel });

    await session.start();
    expect(session.active).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

    const handler = graph.getProcessHandler();
    expect(handler).toBeTypeOf("function");
    handler?.({ inputBuffer: graph.inputBuffer });

    expect(onChunk).toHaveBeenCalledTimes(1);
    const chunk = onChunk.mock.calls[0]?.[0];
    expect(chunk.format).toBe("pcm_f32le");
    expect(chunk.sampleRate).toBe(48_000);
    expect(chunk.samples).toEqual(Float32Array.from([0.1, -0.2, 0.5, 0]));
    expect(chunk.sequence).toBe(0);
    expect(onLevel).toHaveBeenCalledWith(0.5);
  });

  it("TC-002 surfaces a clear permission-denied error", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      Object.assign(new Error("Permission denied"), { name: "NotAllowedError" }),
    );

    const session = createAudioCaptureSession();
    await expect(session.start()).rejects.toMatchObject({
      code: "permission_denied",
      message: expect.stringContaining("denied"),
    });
    expect(session.active).toBe(false);
  });

  it("TC-003 stop releases media tracks and clears activity", async () => {
    const onLevel = vi.fn();
    const session = createAudioCaptureSession({ onLevel });
    await session.start();
    session.stop();

    expect(session.active).toBe(false);
    expect(graph.tracks[0]?.stop).toHaveBeenCalledTimes(1);
    expect(graph.processor.disconnect).toHaveBeenCalled();
    expect(graph.source.disconnect).toHaveBeenCalled();
    expect(graph.audioContext.close).toHaveBeenCalled();
    expect(onLevel).toHaveBeenCalledWith(0);
  });

  it("TC-004 surfaces a meaningful error when no input device exists", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      Object.assign(new Error("Requested device not found"), { name: "NotFoundError" }),
    );

    const session = createAudioCaptureSession();
    await expect(session.start()).rejects.toMatchObject({
      code: "no_device",
      message: expect.stringContaining("No microphone"),
    });
  });
});
