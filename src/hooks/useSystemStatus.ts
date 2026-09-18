import { useCallback, useEffect, useState } from "react";
import { ApiError, getApiBaseUrl } from "@/services/apiClient";
import { fetchHealth } from "@/services/healthService";
import type { SystemStatus } from "@/types";

const initialStatus: SystemStatus = {
  state: "idle",
  message: "System status has not been checked yet.",
  checkedAt: null,
  apiBaseUrl: getApiBaseUrl(),
};

export function useSystemStatus(autoRefreshMs = 30_000) {
  const [status, setStatus] = useState<SystemStatus>(initialStatus);

  const refresh = useCallback(async () => {
    setStatus((current) => ({
      ...current,
      state: "loading",
      message: "Checking backend health…",
      apiBaseUrl: getApiBaseUrl(),
    }));

    try {
      const health = await fetchHealth();
      const isOk = health.status?.toLowerCase() === "ok";

      setStatus({
        state: isOk ? "healthy" : "error",
        message: isOk
          ? `Backend reported status "${health.status}".`
          : `Unexpected backend status: "${health.status}".`,
        checkedAt: new Date().toISOString(),
        apiBaseUrl: getApiBaseUrl(),
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "An unexpected error occurred while checking system status.";

      setStatus({
        state: "error",
        message,
        checkedAt: new Date().toISOString(),
        apiBaseUrl: getApiBaseUrl(),
      });
    }
  }, []);

  useEffect(() => {
    void refresh();

    if (autoRefreshMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, autoRefreshMs);

    return () => window.clearInterval(timer);
  }, [autoRefreshMs, refresh]);

  return { status, refresh };
}
