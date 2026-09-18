const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return configured && configured.length > 0 ? configured.replace(/\/$/, "") : DEFAULT_API_BASE_URL;
}

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new ApiError(`Backend request failed with status ${response.status}.`, response.status);
  }

  return (await response.json()) as T;
}
