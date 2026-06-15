/** Same-origin proxy path — browser always uses this to avoid CORS. */
export const API_PROXY_BASE = "/api/proxy";

/**
 * API base URL for axios / RTK Query.
 * Browser requests always use the same-origin proxy, including production builds
 * where NEXT_PUBLIC_API_BASE_URL may still point at api.xelfcon.com from an old deploy.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return API_PROXY_BASE;
  }

  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured || API_PROXY_BASE;
}

export const apiConfig = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  defaultHeaders: {
    "Content-Type": "application/json",
  },
} as const;
