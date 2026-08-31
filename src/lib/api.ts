/**
 * Single API client for the StayHub backend.
 *
 * Base URL resolution:
 *  - VITE_API_URL when provided (e.g. https://api.example.com/api/v1)
 *  - otherwise "/api/v1", which the Vite dev server proxies to the local backend.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_URL"] ?? "/api/v1";

const TOKEN_KEY = "stayhub.accessToken";
const USER_KEY = "stayhub.user";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  profilePhoto: string | null;
  isVerified: boolean;
  /** True once fullName + phone are both present. Drives the post-login
   * profile setup redirect — see lib/guards.ts. */
  profileComplete: boolean;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; messages: string[] }[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Fired whenever the stored user changes, so the UI can update instantly. */
export const USER_CHANGED_EVENT = "stayhub:user-changed";

function emitUserChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function setSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitUserChanged();
}

/** Replaces the cached user without touching the access token. */
export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitUserChanged();
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  emitUserChanged();
}

export function subscribeToUser(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(USER_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(USER_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Uploads a file with multipart/form-data. `apiRequest` is JSON-only, so
 * uploads need their own path (no Content-Type header — the browser sets the
 * multipart boundary itself).
 */
export async function apiUpload<T>(
  path: string,
  file: File,
  fields: Record<string, string> = {},
): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: form,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const fieldErrors: Record<string, string> = {};
    for (const entry of payload?.errors ?? []) {
      fieldErrors[entry.field] = entry.messages[0] ?? "Invalid value";
    }
    if (response.status === 401) clearSession();
    throw new ApiError(payload?.message ?? "Upload failed", response.status, fieldErrors);
  }

  return payload.data as T;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const fieldErrors: Record<string, string> = {};
    for (const entry of payload?.errors ?? []) {
      fieldErrors[entry.field] = entry.messages[0] ?? "Invalid value";
    }
    if (response.status === 401) clearSession();
    throw new ApiError(payload?.message ?? "Request failed", response.status, fieldErrors);
  }

  return payload.data as T;
}
