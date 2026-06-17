import type { ApiError } from "@/lib/types";

const ORG_SLUG = "zogreo";

export class ApiRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly apiError: string,
    public readonly details?: Record<string, string[]>
  ) {
    super(apiError);
    this.name = "ApiRequestError";
  }
}

async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return jar.get("zogreo_token")?.value ?? null;
  } catch {
    return null;
  }
}

// Returns the URL and headers for a request.
// On the browser: routes through /api/proxy/* so the Next.js server reads
// the httpOnly cookie and attaches the Authorization header.
// On the server: calls the backend directly and reads the cookie itself.
async function resolveRequest(
  path: string,
  isAnonymous: boolean,
  skipOrgHeader: boolean,
  existingHeaders: Headers
): Promise<{ url: string; headers: Headers }> {
  const isBrowser = typeof window !== "undefined";
  const backendBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  if (isBrowser && !isAnonymous) {
    // Authenticated browser request → proxy through Next.js
    const url = `/api/proxy${path}`;
    if (!skipOrgHeader) existingHeaders.set("X-Org-Slug", ORG_SLUG);
    return { url, headers: existingHeaders };
  }

  // Server-side OR anonymous browser request → call backend directly
  const url = `${backendBase}${path}`;
  if (!skipOrgHeader) existingHeaders.set("X-Org-Slug", ORG_SLUG);

  if (!isAnonymous) {
    const token = await getServerToken();
    if (token) existingHeaders.set("Authorization", `Bearer ${token}`);
  }

  return { url, headers: existingHeaders };
}

interface FetchOptions extends RequestInit {
  isAnonymous?: boolean;
  skipOrgHeader?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { isAnonymous = false, skipOrgHeader = false, ...init } = options;

  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const { url, headers: resolvedHeaders } = await resolveRequest(
    path,
    isAnonymous,
    skipOrgHeader,
    headers
  );

  const res = await fetch(url, { ...init, headers: resolvedHeaders });

  if (!res.ok) {
    let errorPayload: any = { statusCode: res.status };
    try {
      errorPayload = await res.json();
    } catch {
      // use default
    }
    const message =
      errorPayload.error ??
      errorPayload.message ??
      errorPayload.title ??
      res.statusText ??
      "An unexpected error occurred.";
    throw new ApiRequestError(
      res.status,
      message,
      errorPayload.details ?? errorPayload.errors
    );
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Unwrap the backend's standard envelope { success, data, message, errors }
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

export function apiGet<T>(path: string, opts?: FetchOptions) {
  return apiFetch<T>(path, { method: "GET", ...opts });
}

export function apiPost<T>(path: string, body?: unknown, opts?: FetchOptions) {
  return apiFetch<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...opts,
  });
}

export function apiPatch<T>(path: string, body?: unknown, opts?: FetchOptions) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...opts,
  });
}

export function apiPut<T>(path: string, body?: unknown, opts?: FetchOptions) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...opts,
  });
}

export function apiDelete<T>(path: string, opts?: FetchOptions) {
  return apiFetch<T>(path, { method: "DELETE", ...opts });
}
