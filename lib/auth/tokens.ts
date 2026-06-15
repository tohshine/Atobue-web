import axios, { type AxiosResponse } from "axios";
import { apiConfig } from "@/lib/api/config";
import { apiRoutes } from "@/lib/api/routes";
import type { RefreshTokenResponse } from "@/lib/types/auth";
import {
  commitStagedCookies,
  extractCookiesFromHeaders,
  getStoredCookies,
  mergeStoredCookies,
  setStoredCookies,
  stageCookies,
  syncCookiesFromDocument,
} from "./cookies";

const TOKEN_KEY = "atobue-access-token";
const AUTH_FLAG_KEY = "atobue-admin-auth";

const refreshClient = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: true,
  headers: { ...apiConfig.defaultHeaders },
});

let refreshPromise: Promise<string | null> | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function getActiveStorage(): Storage | null {
  if (!canUseStorage()) {
    return null;
  }

  if (window.localStorage.getItem(AUTH_FLAG_KEY) === "true") {
    return window.localStorage;
  }

  if (window.sessionStorage.getItem(AUTH_FLAG_KEY) === "true") {
    return window.sessionStorage;
  }

  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, skewMs = 30_000): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return true;
  }

  const now = Date.now();

  if (typeof payload.exp === "number") {
    return now >= payload.exp * 1000 - skewMs;
  }

  if (typeof payload.expires === "number") {
    return now >= payload.expires - skewMs;
  }

  return false;
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const storage = getActiveStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string, rememberMe: boolean): void {
  if (!canUseStorage()) {
    return;
  }

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (!canUseStorage()) {
    return;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(TOKEN_KEY);
  }
}

export function captureAuthCookies(
  response: AxiosResponse,
  rememberMe?: boolean,
): void {
  syncCookiesFromDocument();

  const fromHeader = extractCookiesFromHeaders(
    response.headers["set-cookie"] as string | string[] | undefined,
  );

  if (fromHeader) {
    if (typeof rememberMe === "boolean") {
      setStoredCookies(fromHeader, rememberMe);
      return;
    }

    if (getActiveStorage()) {
      mergeStoredCookies(fromHeader);
    } else {
      stageCookies(fromHeader);
    }
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const storedCookies = getStoredCookies();
      const response = await refreshClient.post<RefreshTokenResponse>(
        apiRoutes.auth.refresh,
        {},
        storedCookies ? { headers: { Cookie: storedCookies } } : undefined,
      );

      captureAuthCookies(response);

      const newToken = response.data?.data?.access_token;
      if (!newToken) {
        return null;
      }

      const storage = getActiveStorage();
      if (storage) {
        storage.setItem(TOKEN_KEY, newToken);
      }

      return newToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function resolveAccessToken(): Promise<string | null> {
  const currentToken = getAccessToken();
  if (!currentToken) {
    return null;
  }

  if (!isAccessTokenExpired(currentToken)) {
    return currentToken;
  }

  return refreshAccessToken();
}
