import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { adminRoutes } from "@/lib/admin-path";
import { clearAuthSession } from "@/lib/auth/session";
import { getStoredCookies } from "@/lib/auth/cookies";
import {
  captureAuthCookies,
  getAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
  resolveAccessToken,
} from "@/lib/auth/tokens";
import { apiConfig, API_PROXY_BASE } from "./config";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuth?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_PROXY_BASE,
  withCredentials: true,
  headers: { ...apiConfig.defaultHeaders },
});

function getRequestLabel(config: InternalAxiosRequestConfig | undefined): string {
  if (!config) {
    return "UNKNOWN";
  }

  const method = config.method?.toUpperCase() ?? "GET";
  return `${method} ${config.url ?? ""}`;
}

function isAuthRoute(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return url.includes("/auth/login") || url.includes("/auth/refresh");
}

function applyAuthHeaders(config: RetryableRequestConfig, token: string | null): RetryableRequestConfig {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const storedCookies = getStoredCookies();
  if (storedCookies) {
    config.headers.Cookie = storedCookies;
  }

  return config;
}

function isCancelledRequest(error: AxiosError): boolean {
  return error.code === "ERR_CANCELED" || error.name === "CanceledError";
}

function summarizeErrorData(data: unknown): string {
  if (data == null) {
    return "";
  }

  if (typeof data === "string") {
    return data.trim();
  }

  try {
    const serialized = JSON.stringify(data);
    return serialized === "{}" ? "" : serialized;
  } catch {
    return "";
  }
}

export function getAxiosErrorMessage(error: AxiosError): string {
  if (isCancelledRequest(error)) {
    return "Request cancelled.";
  }

  if (!error.response) {
    return error.message || "Network error. Check your connection.";
  }

  const { data, status } = error.response;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      return record.errors.map(String).join(", ");
    }
  }

  return `Request failed (${status})`;
}

function logApiError(error: AxiosError): void {
  if (process.env.NODE_ENV !== "development" || isCancelledRequest(error)) {
    return;
  }

  const request = getRequestLabel(error.config);
  const status = error.response?.status ?? "FETCH_ERROR";
  const message = getAxiosErrorMessage(error);
  const dataSummary = summarizeErrorData(error.response?.data);
  const suffix = dataSummary ? ` — ${dataSummary}` : "";

  console.warn(`[API] ${request} failed (${status}): ${message}${suffix}`);
}

apiClient.interceptors.request.use(
  async (config) => {
    const retryableConfig = config as RetryableRequestConfig;

    if (typeof window !== "undefined") {
      retryableConfig.baseURL = API_PROXY_BASE;
    }

    if (isAuthRoute(retryableConfig.url)) {
      return retryableConfig;
    }

    if (!retryableConfig._skipAuth) {
      const token = await resolveAccessToken();
      applyAuthHeaders(retryableConfig, token);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[API Request]", getRequestLabel(retryableConfig));
    }

    return retryableConfig;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[API Request Error]", error);
    }

    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    captureAuthCookies(response);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuth &&
      !isAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        applyAuthHeaders(originalRequest, newToken);
        return apiClient(originalRequest);
      }

      clearAuthSession();

      if (typeof window !== "undefined") {
        window.location.replace(adminRoutes.login);
      }
    }

    logApiError(error);

    return Promise.reject(error);
  },
);

export function isRequestUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isTokenExpiredError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.config) {
    return false;
  }

  const token = getAccessToken();
  return Boolean(token && isAccessTokenExpired(token) && error.response?.status === 401);
}
