import type {
  SystemUsersApiResponse,
  UpdateUserVerificationRequest,
  UpdateUserVerificationResponse,
  UsersResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, void>({
      query: () => apiRoutes.users.list,
      transformResponse: (response: SystemUsersApiResponse): UsersResponse => ({
        users: response.data,
        total: response.data.length,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ user_info }) => ({
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
