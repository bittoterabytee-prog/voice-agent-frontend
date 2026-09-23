import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { playAudioBase64, type PlaybackHandle } from "@/services/audioPlayback";
import { AudioCaptureError } from "@/services/audioCapture";
import {
  createClipRecorderSession,
  type ClipRecorderSession,
} from "@/services/clipRecorder";
import { completeSession, startSession } from "@/services/sessionService";
import { postVoiceTurn } from "@/services/voiceTurnService";
import type { VoiceAgentStatus, VoiceConversationTurn } from "@/types";

const initialStatus: VoiceAgentStatus = {
  phase: "idle",
  message: "Press Start to open a browser voice session.",
  level: 0,
  callId: null,
  conversationId: null,
  sessionId: null,
  turns: [],
  errorCode: null,
};

function newSessionId(): string {
  return `browser-${Date.now()}`;
}

function safeErrorMessage(error: unknown): { message: string; code: string | null } {
  if (error instanceof ApiError) {
    return { message: error.message, code: error.code ?? null };
  }
  if (error instanceof AudioCaptureError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error && error.message.trim()) {
    return { message: error.message, code: null };
  }
  return { message: "Something went wrong. You can retry or press Stop.", code: null };
}

export function useVoiceAgent() {
  const [status, setStatus] = useState<VoiceAgentStatus>(initialStatus);
  const recorderRef = useRef<ClipRecorderSession | null>(null);
  const playbackRef = useRef<PlaybackHandle | null>(null);
  const callIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const turnsRef = useRef<VoiceConversationTurn[]>([]);
  const activeRef = useRef(false);

  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
  }, []);

  const disposeRecorder = useCallback(() => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
  }, []);

  useEffect(
    () => () => {
      activeRef.current = false;
      stopPlayback();
      disposeRecorder();
    },
    [disposeRecorder, stopPlayback],
  );

  const beginListening = useCallback(async () => {
    disposeRecorder();
    const session = createClipRecorderSession({
      onLevel: (level) => {
        setStatus((current) =>
          current.phase === "listening" || current.phase === "processing"
            ? { ...current, level }
            : current,
        );
      },
    });
    recorderRef.current = session;
    await session.start();
  }, [disposeRecorder]);

  const start = useCallback(async () => {
    stopPlayback();
    disposeRecorder();
    turnsRef.current = [];
    callIdRef.current = null;
    conversationIdRef.current = null;
    sessionIdRef.current = newSessionId();
    activeRef.current = true;

    setStatus({
      phase: "processing",
      message: "Starting session…",
      level: 0,
      callId: null,
      conversationId: null,
      sessionId: sessionIdRef.current,
      turns: [],
      errorCode: null,
    });

    try {
      const snapshot = await startSession({ callerNumber: "browser", language: "en" });
      if (!activeRef.current) {
        return;
      }
      callIdRef.current = snapshot.callId;
      conversationIdRef.current = snapshot.conversationId;

      await beginListening();
      if (!activeRef.current) {
        disposeRecorder();
        return;
      }

      setStatus({
        phase: "listening",
        message: "Listening — speak, then press Send turn.",
        level: 0,
        callId: snapshot.callId,
        conversationId: snapshot.conversationId,
        sessionId: sessionIdRef.current,
        turns: [],
        errorCode: null,
      });
    } catch (error) {
      activeRef.current = false;
      disposeRecorder();
      const { message, code } = safeErrorMessage(error);
      setStatus({
        phase: "error",
        message,
        level: 0,
        callId: null,
        conversationId: null,
        sessionId: sessionIdRef.current,
        turns: [],
        errorCode: code,
      });
    }
  }, [beginListening, disposeRecorder, stopPlayback]);

  const sendTurn = useCallback(async () => {
    if (!activeRef.current || !recorderRef.current) {
      return;
    }

    setStatus((current) => ({
      ...current,
      phase: "processing",
      message: "Sending audio turn to the backend…",
      level: 0,
      errorCode: null,
    }));

    let clip;
    try {
      clip = await recorderRef.current.stopAndCollect();
      recorderRef.current = null;
    } catch (error) {
      const { message, code } = safeErrorMessage(error);
      setStatus((current) => ({
        ...current,
        phase: "error",
        message,
        level: 0,
        errorCode: code,
      }));
      return;
    }

    if (!clip) {
      try {
        await beginListening();
        setStatus((current) => ({
          ...current,
          phase: "listening",
          message: "No audio captured — speak, then press Send turn again.",
          level: 0,
          errorCode: null,
        }));
      } catch (error) {
        const { message, code } = safeErrorMessage(error);
        setStatus((current) => ({
          ...current,
          phase: "error",
          message,
          level: 0,
          errorCode: code,
        }));
      }
      return;
    }

    try {
      const response = await postVoiceTurn({
        audioBase64: clip.audioBase64,
        mimeType: clip.mimeType,
        fileName: clip.fileName,
        callId: callIdRef.current ?? undefined,
        conversationId: conversationIdRef.current ?? undefined,
        sessionId: sessionIdRef.current ?? undefined,
      });

      if (!activeRef.current) {
        return;
      }

      if (response.callId) {
        callIdRef.current = response.callId;
      }
      if (response.conversationId) {
        conversationIdRef.current = response.conversationId;
      }
      if (response.sessionId) {
        sessionIdRef.current = response.sessionId;
      }

      const ttsNotice = response.ttsError
        ? `Audio playback unavailable (${response.ttsError.message}). Showing text reply.`
        : null;

      const turn: VoiceConversationTurn = {
        id: `${Date.now()}-${turnsRef.current.length}`,
        transcript: response.transcript,
        replyText: response.replyText,
        ttsNotice,
      };
      turnsRef.current = [...turnsRef.current, turn];

      const baseStatus = {
        callId: callIdRef.current,
        conversationId: conversationIdRef.current,
        sessionId: sessionIdRef.current,
        turns: turnsRef.current,
        errorCode: null as string | null,
        level: 0,
      };

      if (response.audioBase64 && !response.ttsError) {
        setStatus({
          ...baseStatus,
          phase: "speaking",
          message: ttsNotice ?? "Playing agent reply…",
        });

        stopPlayback();
        const playback = playAudioBase64(response.audioBase64, response.mimeType ?? "audio/mpeg");
        playbackRef.current = playback;
        await playback.ended;
        playbackRef.current = null;
      } else {
        setStatus({
          ...baseStatus,
          phase: "listening",
          message: ttsNotice ?? "Turn complete. Speak and press Send turn.",
        });
      }

      if (!activeRef.current) {
        return;
      }

      await beginListening();
      if (!activeRef.current) {
        disposeRecorder();
        return;
      }

      setStatus((current) => ({
        ...current,
        phase: "listening",
        message: ttsNotice
          ? `${ttsNotice} Listening for the next turn.`
          : "Listening — speak, then press Send turn.",
        level: 0,
        turns: turnsRef.current,
        callId: callIdRef.current,
        conversationId: conversationIdRef.current,
        sessionId: sessionIdRef.current,
        errorCode: null,
      }));
    } catch (error) {
      disposeRecorder();
      const { message, code } = safeErrorMessage(error);
      setStatus({
        phase: "error",
        message,
        level: 0,
        turns: turnsRef.current,
        callId: callIdRef.current,
        conversationId: conversationIdRef.current,
        sessionId: sessionIdRef.current,
        errorCode: code,
      });
    }
  }, [beginListening, disposeRecorder, stopPlayback]);

  const stop = useCallback(async () => {
    activeRef.current = false;
    stopPlayback();
    disposeRecorder();

    const callId = callIdRef.current;
    callIdRef.current = null;

    setStatus((current) => ({
      ...current,
      phase: "idle",
      message: "Stopping session…",
      level: 0,
    }));

    if (callId) {
      try {
        await completeSession(callId);
      } catch {
        // Session complete is best-effort; local idle state still applies.
      }
    }

    setStatus({
      phase: "idle",
      message: "Session stopped. Microphone released.",
      level: 0,
      callId: null,
      conversationId: conversationIdRef.current,
      sessionId: sessionIdRef.current,
      turns: turnsRef.current,
      errorCode: null,
    });
  }, [disposeRecorder, stopPlayback]);

  return { status, start, sendTurn, stop };
}
