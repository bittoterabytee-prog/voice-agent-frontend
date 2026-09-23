/**
 * MediaRecorder clip capture for voice turns (KAN-16).
 * Reuses KAN-10 permission / device error mapping; emits webm (or browser-supported) blobs as base64.
 */

import { AudioCaptureError, mapMediaError } from "./audioCapture";

export type RecordedClip = {
  audioBase64: string;
  mimeType: string;
  fileName: string;
  byteLength: number;
};

export type ClipRecorderHandlers = {
  onLevel?: (level: number) => void;
};

export type ClipRecorderSession = {
  start: () => Promise<void>;
  /** Stop recording and return the accumulated clip (or null if empty). */
  stopAndCollect: () => Promise<RecordedClip | null>;
  /** Stop without collecting (discard). */
  cancel: () => void;
  readonly active: boolean;
};

const LEVEL_INTERVAL_MS = 80;

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new AudioCaptureError("unknown", "Failed to encode audio clip as base64."));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => {
      reject(new AudioCaptureError("unknown", "Failed to read recorded audio clip."));
    };
    reader.readAsDataURL(blob);
  });
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }
  if (mimeType.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}

function peakLevel(samples: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const abs = Math.abs(samples[i] ?? 0);
    if (abs > peak) {
      peak = abs;
    }
  }
  return Math.min(1, peak);
}

export function createClipRecorderSession(
  handlers: ClipRecorderHandlers = {},
): ClipRecorderSession {
  let mediaStream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let levelTimer: number | null = null;
  let chunks: Blob[] = [];
  let mimeType = "audio/webm";
  let active = false;

  const clearLevelTimer = () => {
    if (levelTimer !== null) {
      window.clearInterval(levelTimer);
      levelTimer = null;
    }
    handlers.onLevel?.(0);
  };

  const tearDownGraph = () => {
    clearLevelTimer();
    source?.disconnect();
    analyser?.disconnect();
    source = null;
    analyser = null;

    if (audioContext) {
      void audioContext.close();
      audioContext = null;
    }

    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }
      mediaStream = null;
    }

    recorder = null;
    chunks = [];
    active = false;
  };

  const startLevelMeter = (stream: MediaStream) => {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    audioContext = new AudioContextCtor();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);

    levelTimer = window.setInterval(() => {
      if (!analyser) {
        return;
      }
      analyser.getFloatTimeDomainData(buffer);
      handlers.onLevel?.(peakLevel(buffer));
    }, LEVEL_INTERVAL_MS);
  };

  const start = async () => {
    if (active) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new AudioCaptureError(
        "unsupported",
        "This browser does not support microphone capture (MediaDevices.getUserMedia).",
      );
    }

    if (typeof MediaRecorder === "undefined") {
      throw new AudioCaptureError(
        "unsupported",
        "This browser does not support MediaRecorder required for voice turns.",
      );
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      });

      mimeType = pickMimeType();
      chunks = [];
      recorder = new MediaRecorder(mediaStream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.start(250);
      startLevelMeter(mediaStream);
      active = true;
    } catch (error) {
      tearDownGraph();
      throw mapMediaError(error);
    }
  };

  const stopRecorder = (): Promise<void> =>
    new Promise((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });

  const stopAndCollect = async (): Promise<RecordedClip | null> => {
    if (!active) {
      return null;
    }

    await stopRecorder();
    const blob = new Blob(chunks, { type: mimeType });
    tearDownGraph();

    if (blob.size === 0) {
      return null;
    }

    const audioBase64 = await blobToBase64(blob);
    return {
      audioBase64,
      mimeType: blob.type || mimeType,
      fileName: `clip.${extensionForMime(blob.type || mimeType)}`,
      byteLength: blob.size,
    };
  };

  const cancel = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      try {
        recorder.stop();
      } catch {
        // Ignore stop races during cancel.
      }
    }
    tearDownGraph();
  };

  return {
    start,
    stopAndCollect,
    cancel,
    get active() {
      return active;
    },
  };
}
