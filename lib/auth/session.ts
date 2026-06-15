import type { AuthUser } from "@/lib/types/auth";
import { clearStoredCookies, commitStagedCookies, setStoredCookies, syncCookiesFromDocument } from "./cookies";
import { clearAccessToken, setAccessToken } from "./tokens";

const USER_KEY = "atobue-auth-user";
const AUTH_FLAG_KEY = "atobue-admin-auth";

function canUseStorage() {
  return typeof window !== "undefined";
}

function getStorage(rememberMe: boolean): Storage | null {
  if (!canUseStorage()) {
    return null;
  }
  return rememberMe ? window.localStorage : window.sessionStorage;
}

function readAuthFlag(): boolean {
  if (!canUseStorage()) {
    return false;
  }
  return (
    window.localStorage.getItem(AUTH_FLAG_KEY) === "true" ||
    window.sessionStorage.getItem(AUTH_FLAG_KEY) === "true"
  );
}

export function getAuthUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw =
    window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return readAuthFlag() && getAuthUser() !== null;
}

type SetAuthSessionInput = {
  user: AuthUser;
  accessToken: string;
  rememberMe: boolean;
  cookies?: string;
};

export function setAuthSession({
  user,
  accessToken,
  rememberMe,
  cookies,
}: SetAuthSessionInput): void {
  if (!canUseStorage()) {
    return;
  }

  clearAuthSession();

  const storage = getStorage(rememberMe);
  if (!storage) {
    return;
  }

  storage.setItem(USER_KEY, JSON.stringify(user));
  storage.setItem(AUTH_FLAG_KEY, "true");
  setAccessToken(accessToken, rememberMe);

  if (cookies) {
    setStoredCookies(cookies, rememberMe);
  } else {
    commitStagedCookies(rememberMe);
    syncCookiesFromDocument();
  }
}

export function clearAuthSession(): void {
  if (!canUseStorage()) {
    return;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(USER_KEY);
    storage.removeItem(AUTH_FLAG_KEY);
  }

  clearAccessToken();
  clearStoredCookies();
}
