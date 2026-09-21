import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioCaptureError,
  createAudioCaptureSession,
  type AudioChunk,
  type AudioCaptureSession,
} from "@/services/audioCapture";
import type { MicrophoneCaptureStatus } from "@/types";

const initialStatus: MicrophoneCaptureStatus = {
  state: "idle",
  message: "Microphone is idle. Press Start to capture browser audio.",
  level: 0,
  chunkCount: 0,
  lastChunk: null,
  errorCode: null,
};

export function useMicrophoneCapture() {
  const [status, setStatus] = useState<MicrophoneCaptureStatus>(initialStatus);
  const sessionRef = useRef<AudioCaptureSession | null>(null);
  const chunkCountRef = useRef(0);

  const disposeSession = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  useEffect(() => () => disposeSession(), [disposeSession]);

  const start = useCallback(async () => {
    disposeSession();
    chunkCountRef.current = 0;

    setStatus({
      state: "starting",
      message: "Requesting microphone permission…",
      level: 0,
      chunkCount: 0,
      lastChunk: null,
      errorCode: null,
    });

    const session = createAudioCaptureSession({
      onChunk: (chunk: AudioChunk) => {
        chunkCountRef.current += 1;
        setStatus((current) => ({
          ...current,
          state: "capturing",
          message: "Microphone capture is active.",
          chunkCount: chunkCountRef.current,
          lastChunk: {
            sequence: chunk.sequence,
            sampleRate: chunk.sampleRate,
            sampleCount: chunk.samples.length,
            format: chunk.format,
            timestampMs: chunk.timestampMs,
          },
          errorCode: null,
        }));
      },
      onLevel: (level) => {
        setStatus((current) =>
          current.state === "capturing" || current.state === "starting"
            ? { ...current, level }
            : current,
        );
      },
    });

    sessionRef.current = session;

    try {
      await session.start();
      setStatus((current) => ({
        ...current,
        state: "capturing",
        message: "Microphone capture is active.",
        errorCode: null,
      }));
    } catch (error) {
      disposeSession();
      const captureError =
        error instanceof AudioCaptureError
          ? error
          : new AudioCaptureError("unknown", "Microphone capture failed unexpectedly.");

      setStatus({
        state: "error",
        message: captureError.message,
        level: 0,
        chunkCount: 0,
        lastChunk: null,
        errorCode: captureError.code,
      });
    }
  }, [disposeSession]);

  const stop = useCallback(() => {
    disposeSession();
    setStatus({
      state: "idle",
      message: "Capture stopped. Microphone tracks were released.",
      level: 0,
      chunkCount: chunkCountRef.current,
      lastChunk: null,
      errorCode: null,
    });
  }, [disposeSession]);

  return { status, start, stop };
}
