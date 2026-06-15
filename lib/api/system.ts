import type {
  SystemInfo,
  SystemInfoApiResponse,
  UserVerificationDetail,
  UserVerificationRecord,
  VerificationDetailApiResponse,
  VerificationsApiResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

function normalizeVerificationsResponse(response: unknown): UserVerificationRecord[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as VerificationsApiResponse).data;
    return Array.isArray(data) ? data : [];
  }

  return [];
}

function normalizeVerificationDetailResponse(response: unknown): UserVerificationDetail {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as VerificationDetailApiResponse).data;
  }

  return response as UserVerificationDetail;
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => apiRoutes.system.info,
      transformResponse: (response: SystemInfoApiResponse) => response.data,
      providesTags: [{ type: apiTags.system, id: "INFO" }],
    }),
    getVerifications: builder.query<UserVerificationRecord[], void>({
      query: () => apiRoutes.system.verifications,
      transformResponse: normalizeVerificationsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: apiTags.user, id: _id })),
              { type: apiTags.system, id: "VERIFICATIONS" },
            ]
          : [{ type: apiTags.system, id: "VERIFICATIONS" }],
    }),
    getVerificationDetail: builder.query<UserVerificationDetail, string>({
      query: (id) => apiRoutes.system.verificationDetail(id),
      transformResponse: normalizeVerificationDetailResponse,
      providesTags: (_result, _error, id) => [{ type: apiTags.system, id: `VERIFICATION_${id}` }],
    }),
  }),
});

export const {
  useGetSystemInfoQuery,
  useGetVerificationsQuery,
  useGetVerificationDetailQuery,
} = systemApi;
