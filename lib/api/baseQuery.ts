import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { apiClient, getAxiosErrorMessage } from "./axios";

export type ApiError = {
  status: number | "FETCH_ERROR";
  message: string;
};

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  body?: unknown;
  params?: AxiosRequestConfig["params"];
};

function normalizeArgs(args: string | AxiosBaseQueryArgs): AxiosBaseQueryArgs {
  if (typeof args === "string") {
    return { url: args, method: "GET" };
  }

  return args;
}

export const baseQueryWithErrorHandling: BaseQueryFn<
  string | AxiosBaseQueryArgs,
  unknown,
  ApiError
> = async (args) => {
  const { url, method = "GET", body, params } = normalizeArgs(args);

  try {
    const result = await apiClient.request({
      url,
      method,
      data: body,
      params,
    });

    return { data: result.data };
  } catch (error) {
    const axiosError = error as AxiosError;

    return {
      error: {
        status: axiosError.response?.status ?? "FETCH_ERROR",
        message: getAxiosErrorMessage(axiosError),
      },
    };
  }
};
