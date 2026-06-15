const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.xelfcon.com",
  "https://xelfcon.com",
];

const DEV_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function parseExtraOrigins(): string[] {
  const configured = process.env.CORS_ALLOWED_ORIGINS;
  if (!configured) {
    return [];
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const allowedOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS,
  ...parseExtraOrigins(),
  ...(process.env.NODE_ENV === "development" ? DEV_ALLOWED_ORIGINS : []),
];

export function isAllowedOrigin(origin: string | null): origin is string {
  return origin !== null && allowedOrigins.includes(origin);
}

export function getCorsHeaders(origin: string | null): HeadersInit {
  if (!isAllowedOrigin(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function applyCorsHeaders(headers: Headers, origin: string | null): void {
  for (const [key, value] of Object.entries(getCorsHeaders(origin))) {
    headers.set(key, value);
  }
}
