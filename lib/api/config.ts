/**
 * Central API configuration. All network calls read from here.
 *
 * Development: requests go through /api/proxy (same-origin) to avoid CORS.
 * Production: set NEXT_PUBLIC_API_BASE_URL to the external API.
 */
function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "development") {
    return "/api/proxy";
  }

  return "https://api.xelfcon.com/api";
}

export const apiConfig = {
  baseUrl: getBaseUrl(),
  defaultHeaders: {
    "Content-Type": "application/json",
  },
} as const;
