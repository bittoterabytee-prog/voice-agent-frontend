import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, getApiBaseUrl } from "@/services/apiClient";

describe("api client", () => {
  it("returns the configured API base URL", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:3000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("wraps network failures as ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(apiGet("/health")).rejects.toBeInstanceOf(ApiError);
  });
});
