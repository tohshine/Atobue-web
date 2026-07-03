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
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<TicketListItem[], void>({
      query: () => apiRoutes.tickets.list,
      transformResponse: (response: TicketsApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: apiTags.ticket, id: _id })),
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
