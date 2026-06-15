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

export function getAxiosErrorMessage(error: AxiosError): string {
  if (!error.response) {
    return "Network error. Check your connection.";
  }

  const data = error.response.data;
  if (typeof data === "object" && data !== null && "message" in data) {
    return String((data as { message: string }).message);
  }

  return `Request failed (${error.response.status})`;
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

    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", {
        request: getRequestLabel(error.config),
        status: error.response?.status ?? "FETCH_ERROR",
        message: getAxiosErrorMessage(error),
        data: error.response?.data,
      });
    }

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
