const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return configured && configured.length > 0 ? configured.replace(/\/$/, "") : DEFAULT_API_BASE_URL;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

async function parseError(response: Response): Promise<ApiError> {
  let code: string | undefined;
  let message = `Backend request failed with status ${response.status}.`;

  try {
    const body = (await response.json()) as ErrorBody;
    if (typeof body.error?.code === "string" && body.error.code.trim()) {
      code = body.error.code.trim();
    }
    if (typeof body.error?.message === "string" && body.error.message.trim()) {
      message = body.error.message.trim();
    }
  } catch {
    // Non-JSON error bodies still map to a safe status message.
  }

  return new ApiError(message, response.status, code);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Unable to reach the backend API. Check that the server is running.");
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(path, init);
}

export async function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return requestJson<T>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
