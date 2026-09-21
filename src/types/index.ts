export type HealthStatus = "ok" | "degraded" | "unknown";

export interface HealthResponse {
  status: string;
}

export type SystemConnectionState = "idle" | "loading" | "healthy" | "error";

export interface SystemStatus {
  state: SystemConnectionState;
  message: string;
  checkedAt: string | null;
  apiBaseUrl: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface PlaceholderPanel {
  id: string;
  title: string;
  description: string;
}

export type MicrophoneCaptureState = "idle" | "starting" | "capturing" | "error";

export type MicrophoneErrorCode =
  | "permission_denied"
  | "no_device"
  | "device_in_use"
  | "unsupported"
  | "unknown";

export interface MicrophoneChunkSummary {
  sequence: number;
  sampleRate: number;
  sampleCount: number;
  format: "pcm_f32le";
  timestampMs: number;
}

export interface MicrophoneCaptureStatus {
  state: MicrophoneCaptureState;
  message: string;
  /** Peak input level in [0, 1]. */
  level: number;
  chunkCount: number;
  lastChunk: MicrophoneChunkSummary | null;
  errorCode: MicrophoneErrorCode | null;
}
