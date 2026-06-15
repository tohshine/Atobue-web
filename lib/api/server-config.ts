/** Server-only config for the API proxy (dev and production). */
export const serverApiConfig = {
  backendUrl: process.env.API_BACKEND_URL ?? "https://api.xelfcon.com/api",
  proxyOrigin: process.env.API_PROXY_ORIGIN ?? "https://www.xelfcon.com",
} as const;
