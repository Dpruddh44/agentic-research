/**
 * Typed API utilities for communicating with the FastAPI backend.
 * Used by Server Actions to proxy requests.
 */

const BASE_URL = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic typed fetch wrapper with error handling.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || JSON.stringify(errorBody);
    } catch {
      detail = await response.text();
    }

    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      detail,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * POST request helper.
 */
export async function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
): Promise<TRes> {
  return apiFetch<TRes>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
