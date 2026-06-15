import "./register";

export { apiConfig } from "./config";
export { apiClient } from "./axios";
export { apiRoutes } from "./routes";
export { apiTags, type ApiTagType } from "./tags";
export { baseQueryWithErrorHandling, type ApiError } from "./baseQuery";
export { baseApi } from "./base";
export { authApi, useLoginMutation } from "./auth";
export {
  systemApi,
  useGetSystemInfoQuery,
  useGetVerificationsQuery,
  useGetVerificationDetailQuery,
} from "./system";
export {
  usersApi,
  useGetUsersQuery,
  useUpdateUserVerificationMutation,
} from "./users";
export {
  conflictsApi,
  useGetConflictsQuery,
  useResolveConflictMutation,
} from "./conflicts";
