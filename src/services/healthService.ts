import { apiGet } from "./apiClient";
import type { HealthResponse } from "@/types";

export async function fetchHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/health");
}
