import type {
  ConflictsResponse,
  ResolveConflictRequest,
  ResolveConflictResponse,
} from "@/lib/types";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

export const conflictsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConflicts: builder.query<ConflictsResponse, void>({
      query: () => apiRoutes.conflicts.list,
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
