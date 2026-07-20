import type {
  DocsVerificationStatus,
  SystemCashMetrics,
  SystemInfo,
  SystemInfoApiResponse,
  SystemUserMetrics,
  UpdateVerificationApiResponse,
  UpdateVerificationRequest,
  UpdateVerificationResponse,
  UserVerificationDetail,
  UserVerificationRecord,
  VerificationDetailApiResponse,
  VerificationsApiResponse,
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

function coerceMetric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCashMetrics(raw: unknown): SystemCashMetrics {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  return {
    completed_inflow: coerceMetric(source.completed_inflow),
    completed_outflow: coerceMetric(source.completed_outflow),
    net_cashflow: coerceMetric(source.net_cashflow),
    pending_refund_exposure: coerceMetric(source.pending_refund_exposure),
    account_balance: coerceMetric(source.account_balance),
  };
}

function normalizeUserMetrics(raw: unknown): SystemUserMetrics {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  return {
    total_users: coerceMetric(source.total_users),
    active_users: coerceMetric(source.active_users),
  };
}

function normalizeSystemInfoResponse(response: unknown): SystemInfo {
  let payload: unknown = response;

  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "data" in response
  ) {
    payload = (response as SystemInfoApiResponse).data;
  } else if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    !("cash" in response)
  ) {
    payload = (response as { data: unknown }).data;
  }

  const source = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
  const recordId = String(source.id ?? source._id ?? "");

  return {
    cash: normalizeCashMetrics(source.cash),
    users: normalizeUserMetrics(source.users),
    _id: String(source._id ?? recordId),
    id: recordId,
    createdAt: String(source.createdAt ?? ""),
    updatedAt: String(source.updatedAt ?? ""),
    __v: coerceMetric(source.__v),
  };
}

function extractVerifications(response: unknown): UserVerificationRecord[] {
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
  let payload: unknown = response;

  if (typeof response === "object" && response !== null && "data" in response) {
    payload = (response as VerificationDetailApiResponse).data;
  }

  const source =
    typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
  const idDocs =
    typeof source.id_docs === "object" && source.id_docs !== null
      ? (source.id_docs as Record<string, unknown>)
      : null;

  return {
    _id: String(source._id ?? source.id ?? ""),
    user_id: String(source.user_id ?? ""),
    file_type: String(source.file_type ?? ""),
    docs_verification_status: (source.docs_verification_status ?? "pending") as DocsVerificationStatus,
    admin_action: typeof source.admin_action === "string" ? source.admin_action : null,
    viewUrl: String(source.viewUrl ?? idDocs?.url ?? ""),
  };
}

function normalizeUpdateVerificationResponse(response: unknown): UpdateVerificationResponse {
  let payload: unknown = response;

  if (typeof response === "object" && response !== null && "data" in response) {
    payload = (response as UpdateVerificationApiResponse).data;
  }

  const source =
    typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};

  return {
    _id: source._id ? String(source._id) : undefined,
    user_id: source.user_id ? String(source.user_id) : undefined,
    docs_verification_status: source.docs_verification_status as DocsVerificationStatus | undefined,
    admin_action: typeof source.admin_action === "string" ? source.admin_action : null,
  };
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => apiRoutes.system.info,
      transformResponse: normalizeSystemInfoResponse,
      providesTags: [{ type: apiTags.system, id: "INFO" }],
    }),
    getVerifications: builder.query<PaginatedList<UserVerificationRecord>, ListQueryParams | void>({
      query: (args) => ({
        url: apiRoutes.system.verifications,
        params: resolveListQueryParams(args),
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizePaginatedList(response, resolveListQueryParams(arg), extractVerifications),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({ type: apiTags.user, id: _id })),
              { type: apiTags.system, id: "VERIFICATIONS" },
            ]
          : [{ type: apiTags.system, id: "VERIFICATIONS" }],
    }),
    getVerificationDetail: builder.query<UserVerificationDetail, string>({
      query: (id) => apiRoutes.system.verificationDetail(id),
      transformResponse: normalizeVerificationDetailResponse,
      providesTags: (_result, _error, id) => [{ type: apiTags.system, id: `VERIFICATION_${id}` }],
    }),
    updateVerification: builder.mutation<UpdateVerificationResponse, UpdateVerificationRequest>({
      query: ({ docsId, action }) => ({
        url: apiRoutes.system.verificationDetail(docsId),
        method: "PATCH",
        body: { action },
      }),
      transformResponse: normalizeUpdateVerificationResponse,
      async onQueryStarted({ docsId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.docs_verification_status || data.admin_action !== undefined) {
            dispatch(
              systemApi.util.updateQueryData("getVerificationDetail", docsId, (draft) => {
                if (data.docs_verification_status) {
                  draft.docs_verification_status = data.docs_verification_status;
                }
                if (data.admin_action !== undefined) {
                  draft.admin_action = data.admin_action;
                }
              }),
            );
          }
        } catch {
          // Mutation error is surfaced by the hook.
        }
      },
      invalidatesTags: (_result, _error, { docsId }) => [
        { type: apiTags.system, id: `VERIFICATION_${docsId}` },
        { type: apiTags.system, id: "VERIFICATIONS" },
      ],
    }),
  }),
});

export const {
  useGetSystemInfoQuery,
  useGetVerificationsQuery,
  useGetVerificationDetailQuery,
  useUpdateVerificationMutation,
} = systemApi;
