/**
 * Browser microphone capture for the voice-agent POC (KAN-10).
 * Produces PCM float32 mono chunks for a future STT handoff — no STT/TTS here.
 */

export type AudioChunkFormat = "pcm_f32le";

/** Handoff payload for a future STT client pipeline. */
export interface AudioChunk {
  /** Mono PCM samples in [-1, 1]. */
  samples: Float32Array;
  sampleRate: number;
  channelCount: 1;
  format: AudioChunkFormat;
  /** Monotonic chunk index within a capture session (starts at 0). */
  sequence: number;
  /** Performance.now() when the chunk was emitted. */
  timestampMs: number;
}

export type AudioCaptureErrorCode =
  | "permission_denied"
  | "no_device"
  | "device_in_use"
  | "unsupported"
  | "unknown";

export class AudioCaptureError extends Error {
  readonly code: AudioCaptureErrorCode;

  constructor(code: AudioCaptureErrorCode, message: string) {
    super(message);
    this.name = "AudioCaptureError";
    this.code = code;
  }
}

export interface AudioCaptureHandlers {
  onChunk?: (chunk: AudioChunk) => void;
  /** Normalized peak level in [0, 1] for UI metering. */
  onLevel?: (level: number) => void;
}

export interface AudioCaptureSession {
  start: () => Promise<void>;
  stop: () => void;
  readonly active: boolean;
}

const PROCESSOR_BUFFER_SIZE = 4096;

export function mapMediaError(error: unknown): AudioCaptureError {
  if (error instanceof AudioCaptureError) {
    return error;
  }

  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: string }).name)
      : "";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return new AudioCaptureError(
        "permission_denied",
        "Microphone permission was denied. Allow mic access in the browser and try again.",
      );
    case "NotFoundError":
    case "DevicesNotFoundError":
      return new AudioCaptureError(
        "no_device",
        "No microphone was found. Connect an input device and try again.",
      );
    case "NotReadableError":
    case "TrackStartError":
      return new AudioCaptureError(
        "device_in_use",
        "The microphone could not be opened. It may be in use by another application.",
      );
    case "SecurityError":
      return new AudioCaptureError(
        "permission_denied",
        "Microphone access is blocked in this context. Use HTTPS or localhost.",
      );
    default: {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Microphone capture failed unexpectedly.";
      return new AudioCaptureError("unknown", message);
    }
  }
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

function downmixToMono(input: Float32Array, channelCount: number): Float32Array {
  if (channelCount <= 1) {
    return input.slice();
  }

  const frameCount = Math.floor(input.length / channelCount);
  const mono = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      sum += input[frame * channelCount + channel] ?? 0;
    }
    mono[frame] = sum / channelCount;
  }

  return mono;
}

export function createAudioCaptureSession(
  handlers: AudioCaptureHandlers = {},
): AudioCaptureSession {
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let sequence = 0;
  let active = false;

  const stop = () => {
    processor?.disconnect();
    source?.disconnect();
    processor = null;
    source = null;

    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }
      mediaStream = null;
    }

    if (audioContext) {
      void audioContext.close();
      audioContext = null;
    }

    active = false;
    handlers.onLevel?.(0);
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

    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      throw new AudioCaptureError(
        "unsupported",
        "This browser does not support the Web Audio API required for capture.",
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

      audioContext = new AudioContextCtor();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      source = audioContext.createMediaStreamSource(mediaStream);
      // ScriptProcessor is deprecated but widely available; suitable for POC chunking.
      processor = audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      sequence = 0;

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer;
        const samples = downmixToMono(input.getChannelData(0), 1);
        const level = peakLevel(samples);
        handlers.onLevel?.(level);

        const chunk: AudioChunk = {
          samples,
          sampleRate: audioContext?.sampleRate ?? input.sampleRate,
          channelCount: 1,
          format: "pcm_f32le",
          sequence,
          timestampMs: performance.now(),
        };
        sequence += 1;
        handlers.onChunk?.(chunk);
      };

      source.connect(processor);
      // Keep the graph alive without playing mic audio through speakers.
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);
      active = true;
    } catch (error) {
      stop();
      throw mapMediaError(error);
    }
  };

  return {
    start,
    stop,
    get active() {
      return active;
    },
  };
}
