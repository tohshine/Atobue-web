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
  useUpdateVerificationMutation,
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
export {
  ticketsApi,
  useGetTicketDetailQuery,
  useGetTicketLedgerQuery,
  useGetTicketRoomMessagesQuery,
  useGetTicketsQuery,
} from "./tickets";
export {
  refundsApi,
  useGetRefundOrderDetailQuery,
  useGetRefundOrdersQuery,
} from "./refunds";
export {
  adminDataApi,
  useGetUnitCategoriesQuery,
  useGetRentDurationsQuery,
  useGetFeaturesQuery,
  useGetServicesQuery,
  useGetAmenitiesQuery,
  useAddAdminDataMutation,
  useRemoveAdminDataMutation,
} from "./admin-data";
