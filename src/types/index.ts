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
