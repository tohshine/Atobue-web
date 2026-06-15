const COOKIE_KEY = "atobue-auth-cookies";
const AUTH_FLAG_KEY = "atobue-admin-auth";

let stagedCookies: string | null = null;

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

function mergeCookieStrings(existing: string, incoming: string): string {
  const jar = new Map<string, string>();

  for (const source of [existing, incoming]) {
    if (!source.trim()) {
      continue;
    }

    for (const part of source.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) {
        continue;
      }

      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        continue;
      }

      const name = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      jar.set(name, value);
    }
  }

  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function stageCookies(cookies: string): void {
  if (!cookies.trim()) {
    return;
  }

  stagedCookies = mergeCookieStrings(stagedCookies ?? "", cookies);
}

export function commitStagedCookies(rememberMe: boolean): void {
  if (!stagedCookies) {
    return;
  }

  setStoredCookies(stagedCookies, rememberMe);
  stagedCookies = null;
}

export function getStoredCookies(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const storage = getActiveStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(COOKIE_KEY);
}

export function setStoredCookies(cookies: string, rememberMe: boolean): void {
  if (!canUseStorage() || !cookies.trim()) {
    return;
  }

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(COOKIE_KEY, cookies);
}

export function mergeStoredCookies(incoming: string): void {
  if (!canUseStorage() || !incoming.trim()) {
    return;
  }

  const storage = getActiveStorage();
  if (!storage) {
    return;
  }

  const existing = storage.getItem(COOKIE_KEY) ?? "";
  storage.setItem(COOKIE_KEY, mergeCookieStrings(existing, incoming));
}

export function clearStoredCookies(): void {
  if (!canUseStorage()) {
    return;
  }

  stagedCookies = null;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(COOKIE_KEY);
  }
}

export function syncCookiesFromDocument(): void {
  if (!canUseStorage() || !document.cookie) {
    return;
  }

  if (getActiveStorage()) {
    mergeStoredCookies(document.cookie);
    return;
  }

  stageCookies(document.cookie);
}

export function extractCookiesFromHeaders(
  setCookieHeader: string | string[] | undefined,
): string | null {
  if (!setCookieHeader) {
    return null;
  }

  const values = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const pairs = values
    .map((entry) => entry.split(";")[0]?.trim())
    .filter((entry): entry is string => Boolean(entry));

  return pairs.length > 0 ? pairs.join("; ") : null;
}
