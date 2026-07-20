import type {
  RefundOrderDetail,
  RefundOrderDetailApiResponse,
  RefundOrderListItem,
  RefundOrdersApiResponse,
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

function extractRefundOrders(response: unknown): RefundOrderListItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as RefundOrdersApiResponse).data;
    return Array.isArray(data) ? data : [];
  }

  return [];
}

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRefundOrders: builder.query<PaginatedList<RefundOrderListItem>, ListQueryParams | void>({
      query: (args) => ({
        url: apiRoutes.refunds.list,
        params: resolveListQueryParams(args),
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizePaginatedList(response, resolveListQueryParams(arg), extractRefundOrders),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({ type: apiTags.refund, id: _id })),
              { type: apiTags.refunds, id: "LIST" },
            ]
          : [{ type: apiTags.refunds, id: "LIST" }],
    }),
    getRefundOrderDetail: builder.query<RefundOrderDetail, string>({
      query: (orderId) => apiRoutes.refunds.detail(orderId),
      transformResponse: (response: RefundOrderDetailApiResponse) => response.data,
      providesTags: (_result, _error, orderId) => [{ type: apiTags.refund, id: orderId }],
    }),
  }),
});

export const { useGetRefundOrdersQuery, useGetRefundOrderDetailQuery } = refundsApi;
