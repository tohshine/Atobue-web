import type {
  RefundOrderDetail,
  RefundOrderDetailApiResponse,
  RefundOrderListItem,
  RefundOrdersApiResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRefundOrders: builder.query<RefundOrderListItem[], void>({
      query: () => apiRoutes.refunds.list,
      transformResponse: (response: RefundOrdersApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: apiTags.refund, id: _id })),
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
