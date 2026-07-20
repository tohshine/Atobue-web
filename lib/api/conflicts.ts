import type {
  ConflictsResponse,
  ResolveConflictRequest,
  ResolveConflictResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import { resolveListQueryParams, type ListQueryParams } from "./pagination";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

function normalizeConflictsResponse(
  response: unknown,
  args: { limit: number; p: number },
): ConflictsResponse {
  const source =
    typeof response === "object" && response !== null
      ? (response as Partial<ConflictsResponse> & Record<string, unknown>)
      : {};
  const conflicts = Array.isArray(source.conflicts) ? source.conflicts : [];
  const total = Number.isFinite(Number(source.total)) ? Number(source.total) : conflicts.length;
  const pageCount = Math.max(1, Math.ceil(total / args.limit));

  return {
    conflicts,
    total,
    open: Number.isFinite(Number(source.open)) ? Number(source.open) : 0,
    resolved: Number.isFinite(Number(source.resolved)) ? Number(source.resolved) : 0,
    escalated: Number.isFinite(Number(source.escalated)) ? Number(source.escalated) : 0,
    page: args.p,
    limit: args.limit,
    hasMore: args.p * args.limit < total,
    pageCount,
  };
}

export const conflictsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConflicts: builder.query<ConflictsResponse, ListQueryParams | void>({
      query: (args) => ({
        url: apiRoutes.conflicts.list,
        params: resolveListQueryParams(args),
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeConflictsResponse(response, resolveListQueryParams(arg)),
      providesTags: (result) =>
        result
          ? [
              ...result.conflicts.map(({ id }) => ({ type: apiTags.conflict, id })),
              { type: apiTags.conflicts, id: "LIST" },
            ]
          : [{ type: apiTags.conflicts, id: "LIST" }],
    }),
    resolveConflict: builder.mutation<ResolveConflictResponse, ResolveConflictRequest>({
      query: ({ conflictId, action, notes }) => ({
        url: apiRoutes.conflicts.resolve(conflictId),
        method: "PATCH",
        body: { action, notes },
      }),
      invalidatesTags: (_result, _error, { conflictId }) => [
        { type: apiTags.conflict, id: conflictId },
        { type: apiTags.conflicts, id: "LIST" },
      ],
    }),
  }),
});

export const { useGetConflictsQuery, useResolveConflictMutation } = conflictsApi;
