export const DEFAULT_PAGE_LIMIT = 3;

export type ListQueryParams = {
  limit?: number;
  p?: number;
};

export type PaginatedList<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number | null;
  hasMore: boolean;
  pageCount: number | null;
};

export function resolveListQueryParams(args?: ListQueryParams | void) {
  const limit = args?.limit ?? DEFAULT_PAGE_LIMIT;
  const p = Math.max(1, args?.p ?? 1);
  return { limit, p };
}

function readNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readTotal(response: unknown): number | null {
  if (typeof response !== "object" || response === null) {
    return null;
  }

  const record = response as Record<string, unknown>;
  const fromRoot = readNumber(record.total) ?? readNumber(record.count);
  if (fromRoot !== null) {
    return fromRoot;
  }

  if (typeof record.meta === "object" && record.meta !== null) {
    const meta = record.meta as Record<string, unknown>;
    const fromMeta = readNumber(meta.total) ?? readNumber(meta.count);
    if (fromMeta !== null) {
      return fromMeta;
    }
  }

  if (typeof record.pagination === "object" && record.pagination !== null) {
    const pagination = record.pagination as Record<string, unknown>;
    return readNumber(pagination.total) ?? readNumber(pagination.count);
  }

  return null;
}

export function normalizePaginatedList<T>(
  response: unknown,
  args: { limit: number; p: number },
  extractItems: (response: unknown) => T[],
): PaginatedList<T> {
  const items = extractItems(response);
  const total = readTotal(response);
  const pageCount = total !== null ? Math.max(1, Math.ceil(total / args.limit)) : null;
  const hasMore = total !== null ? args.p * args.limit < total : items.length >= args.limit;

  return {
    items,
    page: args.p,
    limit: args.limit,
    total,
    hasMore,
    pageCount,
  };
}
