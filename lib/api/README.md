# API & Network Layer

Centralized server integration for the admin console. All network calls flow through **RTK Query** under `lib/api/`; domain types live in `lib/types/`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin pages (client components)                                │
│  import { useGetUsersQuery } from "@/lib/api"                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  lib/api/                                                       │
│  ├── config.ts      → base URL, default headers, auth hook      │
│  ├── routes.ts      → single source of truth for API paths      │
│  ├── tags.ts        → RTK Query cache tag names                 │
│  ├── baseQuery.ts   → fetch wrapper + normalized errors         │
│  ├── base.ts        → createApi (RTK Query root)              │
│  ├── users.ts       → user endpoints                            │
│  ├── conflicts.ts   → conflict endpoints                        │
│  ├── register.ts    → registers all endpoint slices             │
│  └── index.ts       → public exports (import from here)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
┌────────▼────────────┐              ┌───────────▼──────────────┐
│  External backend   │              │  Next.js route handlers  │
│  (production)       │              │  app/api/* (local dev)   │
│  NEXT_PUBLIC_       │              │                          │
│  API_BASE_URL       │              │                          │
└─────────────────────┘              └──────────────────────────┘
```

## Directory layout

| Path | Purpose |
|------|---------|
| `lib/types/` | Shared domain & response types (`AdminUser`, `ConflictItem`, …) |
| `lib/api/config.ts` | Environment-driven base URL and header preparation |
| `lib/api/routes.ts` | All API path strings — update here when backend routes change |
| `lib/api/*.ts` | RTK Query endpoint definitions (queries & mutations) |
| `lib/store/` | Redux store, typed hooks, `StoreProvider` |
| `app/api/` | Next.js mock/staging route handlers (optional during dev) |

## Request flow

1. A page calls an RTK Query hook (e.g. `useGetUsersQuery()`).
2. RTK Query dispatches through `baseQueryWithErrorHandling` in `baseQuery.ts`.
3. `fetchBaseQuery` sends the request to `apiConfig.baseUrl + apiRoutes.*`.
4. On success, data is cached with tags from `tags.ts`.
5. Mutations invalidate related tags so lists refresh automatically.

## Environment

Copy `.env.example` to `.env.local`:

```bash
# Empty → requests go to /api/* (Next.js route handlers on same origin)
NEXT_PUBLIC_API_BASE_URL=

# Production → point at your backend
# NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## Adding a new endpoint

1. **Types** — add domain/response types in `lib/types/`.
2. **Route** — add the path in `lib/api/routes.ts`.
3. **Tag** — add a cache tag in `lib/api/tags.ts` (and append to `apiTagTypes`).
4. **Slice** — create `lib/api/<resource>.ts` with `baseApi.injectEndpoints(...)`.
5. **Register** — import the new slice in `lib/api/register.ts`.
6. **Export** — re-export hooks from `lib/api/index.ts`.
7. **Consume** — use the generated hook in your page/component.

Example slice skeleton:

```ts
// lib/api/ledger.ts
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

export const ledgerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLedger: builder.query<LedgerResponse, void>({
      query: () => apiRoutes.ledger.list,
      providesTags: [{ type: apiTags.ledger, id: "LIST" }],
    }),
  }),
});

export const { useGetLedgerQuery } = ledgerApi;
```

## Auth (when backend is ready)

Edit `prepareApiHeaders` in `lib/api/config.ts`:

```ts
export function prepareApiHeaders(headers: Headers): Headers {
  const token = getAccessToken(); // your session/cookie helper
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
```

## Hooks reference

| Hook | Method | Route |
|------|--------|-------|
| `useGetUsersQuery` | GET | `/api/users` |
| `useUpdateUserVerificationMutation` | PATCH | `/api/users/:id/verification` |
| `useGetConflictsQuery` | GET | `/api/conflicts` |
| `useResolveConflictMutation` | PATCH | `/api/conflicts/:id/resolve` |

## Rules

- **Do not** call `fetch()` directly in pages — use RTK Query hooks from `@/lib/api`.
- **Do not** hardcode API paths in components — use `apiRoutes`.
- **Do not** duplicate types under `app/` — import from `@/lib/types`.
- `_lib/users.ts` and `_lib/conflicts.ts` re-export types for backward compatibility only.

## Store provider

The admin layout wraps pages with `StoreProvider` (`lib/store/provider.tsx`). RTK Query hooks only work inside that tree.
