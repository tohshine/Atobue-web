/** Server-only config for the development API proxy. */
export const serverApiConfig = {
  backendUrl: process.env.API_BACKEND_URL ?? "https://api.xelfcon.com/api",
  proxyOrigin: process.env.API_PROXY_ORIGIN ?? "https://xelfcon.com",
} as const;
