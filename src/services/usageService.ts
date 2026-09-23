import { apiGet } from "./apiClient";
import type { SpendSummary } from "@/types";

export async function fetchSpendSummary(): Promise<SpendSummary> {
  return apiGet<SpendSummary>("/api/usage/summary");
}
