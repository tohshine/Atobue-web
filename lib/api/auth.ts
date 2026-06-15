import type { LoginRequest, LoginResponse, LoginResult } from "@/lib/types/auth";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginRequest>({
      query: (body) => ({
        url: apiRoutes.auth.login,
        method: "POST",
        body,
      }),
      transformResponse: (response: LoginResponse): LoginResult => {
        const { access_token, ...user } = response.data;
        return { user, access_token };
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
