import type {
  SystemUser,
  SystemUsersApiResponse,
  UpdateUserVerificationRequest,
  UpdateUserVerificationResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import {
  normalizePaginatedList,
  resolveListQueryParams,
  type ListQueryParams,
  type PaginatedList,
} from "./pagination";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

function extractUsers(response: unknown): SystemUser[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as SystemUsersApiResponse).data;
    return Array.isArray(data) ? data : [];
  }

  return [];
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedList<SystemUser>, ListQueryParams | void>({
      query: (args) => ({
        url: apiRoutes.users.list,
        params: resolveListQueryParams(args),
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizePaginatedList(response, resolveListQueryParams(arg), extractUsers),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ user_info }) => ({
                type: apiTags.user,
                id: user_info._id,
              })),
              { type: apiTags.users, id: "LIST" },
            ]
          : [{ type: apiTags.users, id: "LIST" }],
    }),
    updateUserVerification: builder.mutation<
      UpdateUserVerificationResponse,
      UpdateUserVerificationRequest
    >({
      query: ({ userId, status }) => ({
        url: apiRoutes.users.verification(userId),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: apiTags.user, id: userId },
        { type: apiTags.users, id: "LIST" },
        { type: apiTags.system, id: "VERIFICATIONS" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserVerificationMutation,
} = usersApi;
