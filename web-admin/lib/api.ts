const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Resolves a possibly-relative media URL (e.g. "/uploads/posters/x.png")
// returned by the API into an absolute URL the browser can load.
export function apiUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cp_access_token");
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("cp_access_token", accessToken);
  localStorage.setItem("cp_refresh_token", refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem("cp_access_token");
  localStorage.removeItem("cp_refresh_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cp_refresh_token");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

// For multipart/form-data uploads (movie poster/trailer). Do not set
// Content-Type manually — the browser needs to add the multipart boundary.
export async function apiUpload<T = unknown>(path: string, file: File): Promise<T> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Upload failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}
