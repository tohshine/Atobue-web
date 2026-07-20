type PaginationBarProps = {
  page: number;
  pageCount: number | null;
  hasMore: boolean;
  total: number | null;
  itemCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function PaginationBar({
  page,
  pageCount,
  hasMore,
  total,
  itemCount,
  onPageChange,
  disabled = false,
}: PaginationBarProps) {
  const canPrev = page > 1 && !disabled;
  const canNext = !disabled && (pageCount !== null ? page < pageCount : hasMore);

  const summaryParts = [`Page ${page}`];
  if (pageCount !== null) {
    summaryParts[0] = `Page ${page} of ${pageCount}`;
  }
  summaryParts.push(`${itemCount} shown`);
  if (total !== null) {
    summaryParts.push(`of ${total}`);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
      <p className="text-xs text-white/50">{summaryParts.join(" · ")}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
