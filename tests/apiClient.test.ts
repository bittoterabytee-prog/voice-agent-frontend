import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, apiPost, getApiBaseUrl } from "@/services/apiClient";

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

  it("posts JSON bodies and returns parsed responses", async () => {
    const fetchMock = vi.fn(async () =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({ callId: "call-1" }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiPost("/api/sessions", { language: "en" })).resolves.toEqual({
      callId: "call-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/sessions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ language: "en" }),
      }),
    );
  });

  it("maps backend error envelopes without leaking raw payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: async () => ({
            error: {
              code: "EXTERNAL_SERVICE_UNAVAILABLE",
              message: "Speech service is unavailable.",
            },
          }),
        }),
      ),
    );

    await expect(apiPost("/api/voice/turn", { audioBase64: "AQID" })).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      code: "EXTERNAL_SERVICE_UNAVAILABLE",
      message: "Speech service is unavailable.",
    });
  });
});
