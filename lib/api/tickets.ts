import type {
  TicketDetail,
  TicketDetailApiResponse,
  TicketLedgerApiResponse,
  TicketLedgerRecord,
  TicketListItem,
  TicketRoomMessagesApiResponse,
  TicketRoomThread,
  TicketsApiResponse,
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

function extractTickets(response: unknown): TicketListItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as TicketsApiResponse).data;
    return Array.isArray(data) ? data : [];
  }

  return [];
}

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<PaginatedList<TicketListItem>, ListQueryParams | void>({
      query: (args) => ({
        url: apiRoutes.tickets.list,
        params: resolveListQueryParams(args),
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizePaginatedList(response, resolveListQueryParams(arg), extractTickets),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({ type: apiTags.ticket, id: _id })),
              { type: apiTags.tickets, id: "LIST" },
            ]
          : [{ type: apiTags.tickets, id: "LIST" }],
    }),
    getTicketDetail: builder.query<TicketDetail, string>({
      query: (ticketId) => apiRoutes.tickets.detail(ticketId),
      transformResponse: (response: TicketDetailApiResponse) => response.data,
      providesTags: (_result, _error, ticketId) => [{ type: apiTags.ticket, id: ticketId }],
    }),
    getTicketRoomMessages: builder.query<TicketRoomThread[], string>({
      query: (roomId) => apiRoutes.tickets.roomMessages(roomId),
      transformResponse: (response: TicketRoomMessagesApiResponse) => response.data,
    }),
    getTicketLedger: builder.query<TicketLedgerRecord, string>({
      query: (ledgerId) => apiRoutes.tickets.ledger(ledgerId),
      transformResponse: (response: TicketLedgerApiResponse) => response.data,
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketDetailQuery,
  useGetTicketRoomMessagesQuery,
  useGetTicketLedgerQuery,
} = ticketsApi;
