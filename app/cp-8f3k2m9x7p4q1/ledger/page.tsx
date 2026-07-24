"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminRoutes } from "@/lib/admin-path";
import { useGetTicketLedgerQuery } from "@/lib/api";
import type { TicketLedgerHistoryItem, TicketLedgerRecord } from "@/lib/types";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency } from "../_lib/data";

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency = "NGN") {
  if (currency === "NGN") {
    return formatCurrency(amount);
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function humanize(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function paymentStatusPill(status: string | null | undefined) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium";
  const normalized = status?.toLowerCase();

  if (normalized === "success" || normalized === "completed") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }

  if (normalized === "pending") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }

  if (normalized === "failed" || normalized === "rejected") {
    return `${common} bg-rose-400/15 text-rose-200`;
  }

  return `${common} bg-white/10 text-white/70`;
}

function movementPill(entry: TicketLedgerHistoryItem) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase";

  if (entry.moneyIn > 0 && entry.moneyOut === 0) {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }

  if (entry.moneyOut > 0 && entry.moneyIn === 0) {
    return `${common} bg-rose-400/15 text-rose-200`;
  }

  return `${common} bg-cyan-400/15 text-cyan-200`;
}

function MetricCard({
  label,
  value,
  tone,
  caption,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "emerald" | "rose" | "amber";
  caption?: string;
}) {
  const toneClasses = {
    cyan: "text-cyan-200",
    emerald: "text-emerald-200",
    rose: "text-rose-200",
    amber: "text-amber-200",
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-wide text-white/45">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
      {caption ? <p className="mt-1 text-xs text-white/45">{caption}</p> : null}
    </article>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-white/45">{label}</p>
      <div className="mt-1 wrap-break-word text-sm text-white/85">{value}</div>
    </div>
  );
}

function LedgerHistoryCard({ entry }: { entry: TicketLedgerHistoryItem }) {
  const amountColor =
    entry.moneyIn > 0 && entry.moneyOut === 0
      ? "text-emerald-200"
      : entry.moneyOut > 0 && entry.moneyIn === 0
        ? "text-rose-200"
        : "text-cyan-200";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={movementPill(entry)}>
              {entry.moneyIn > 0 && entry.moneyOut === 0
                ? "Credit"
                : entry.moneyOut > 0 && entry.moneyIn === 0
                  ? "Debit"
                  : "Mixed"}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
              {humanize(entry.type)}
            </span>
            {entry.payment?.status ? (
              <span className={paymentStatusPill(entry.payment.status)}>{humanize(entry.payment.status)}</span>
            ) : null}
          </div>
          <p className="mt-3 text-base font-semibold text-white/95">{formatDateTime(entry.createdAt)}</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-white/45">Net Movement</p>
          <p className={`mt-1 text-xl font-semibold ${amountColor}`}>
            {formatMoney(entry.moneyIn - entry.moneyOut, entry.currency)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Money In" value={formatMoney(entry.moneyIn, entry.currency)} />
        <InfoCard label="Money Out" value={formatMoney(entry.moneyOut, entry.currency)} />
        <InfoCard label="Payment Id" value={entry.payment_id ?? "Not available"} />
        <InfoCard label="Updated At" value={formatDateTime(entry.updatedAt)} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoCard label="User Id" value={entry.user_id} />
        <InfoCard label="Payment Reference" value={entry.payment?.reference ?? "Not available"} />
      </div>

      {entry.payment ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/8 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-cyan-100/65">Linked Payment</p>
              <p className="mt-1 text-sm font-medium text-cyan-50">
                {humanize(entry.payment.type)} · {formatMoney(entry.payment.amount_paid, entry.payment.currency)}
              </p>
            </div>
            <span className={paymentStatusPill(entry.payment.status)}>{humanize(entry.payment.status)}</span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <InfoCard label="Payment Ref" value={entry.payment.reference} />
            <InfoCard label="Success Time" value={formatDateTime(entry.payment.success_time)} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

function LedgerSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 rounded-2xl bg-white/5" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.5fr]">
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function LedgerContent({
  ledger,
  initialQuery,
}: {
  ledger: TicketLedgerRecord;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [movementFilter, setMovementFilter] = useState<"all" | "credit" | "debit">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const summary = ledger.summary;
  const history = ledger.history;
  const netBalance = summary.total_money_in - summary.total_money_out;

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        entry._id.toLowerCase().includes(normalizedQuery) ||
        entry.user_id.toLowerCase().includes(normalizedQuery) ||
        (entry.payment_id ?? "").toLowerCase().includes(normalizedQuery) ||
        entry.type.toLowerCase().includes(normalizedQuery) ||
        (entry.payment?.reference ?? "").toLowerCase().includes(normalizedQuery) ||
        (entry.payment?._id ?? "").toLowerCase().includes(normalizedQuery);

      const matchesMovement =
        movementFilter === "all" ||
        (movementFilter === "credit" && entry.moneyIn > 0 && entry.moneyOut === 0) ||
        (movementFilter === "debit" && entry.moneyOut > 0 && entry.moneyIn === 0);

      const paymentStatus = entry.payment?.status ?? "unknown";
      const matchesPaymentStatus =
        paymentStatusFilter === "all" || paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase();

      return matchesQuery && matchesMovement && matchesPaymentStatus;
    });
  }, [history, movementFilter, paymentStatusFilter, query]);

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(history.map((entry) => entry.payment?.status).filter(Boolean) as string[])).sort();
  }, [history]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-2" aria-label="Ledger keywords">
          {["Summary", "History", "Credits", "Debits"].map((word) => (
            <li
              key={word}
              className="pill border border-white/10 bg-white/6 px-3 py-1 text-[11px] tracking-[0.12em] text-white/70 uppercase"
            >
              {word}
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/50">
          {summary.entry_count} entries · Net {formatMoney(netBalance)}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Money In"
          value={formatMoney(summary.total_money_in)}
          tone="emerald"
          caption="All money credited to this ledger"
        />
        <MetricCard
          label="Total Money Out"
          value={formatMoney(summary.total_money_out)}
          tone="rose"
          caption="All money debited from this ledger"
        />
        <MetricCard
          label="Net Position"
          value={formatMoney(netBalance)}
          tone={netBalance >= 0 ? "cyan" : "amber"}
          caption="Credits minus debits"
        />
        <MetricCard
          label="Entry Count"
          value={summary.entry_count}
          tone="amber"
          caption="Ledger history items returned"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
        <section className="card-soft rounded-2xl p-5 md:p-6">
          <h3 className="text-lg font-semibold">Ledger Snapshot</h3>
          <div className="mt-4 grid gap-3">
            <InfoCard label="Owner Id" value={summary._id} />
            <InfoCard label="First Entry" value={formatDateTime(summary.first_entry_at)} />
            <InfoCard label="Last Entry" value={formatDateTime(summary.last_entry_at)} />
            <InfoCard
              label="Activity Window"
              value={
                summary.first_entry_at && summary.last_entry_at
                  ? `${formatDateTime(summary.first_entry_at)} -> ${formatDateTime(summary.last_entry_at)}`
                  : "Not available"
              }
            />
          </div>
        </section>

        <section className="card-soft rounded-2xl p-5 md:p-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] grow text-sm">
              <span className="text-xs uppercase tracking-wide text-white/45">Search History</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by transaction id, payment id, ref, or user id"
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-(--brand)"
              />
            </label>

            <label className="text-sm">
              <span className="text-xs uppercase tracking-wide text-white/45">Movement</span>
              <select
                value={movementFilter}
                onChange={(event) => setMovementFilter(event.target.value as "all" | "credit" | "debit")}
                className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
              >
                <option value="all">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="text-xs uppercase tracking-wide text-white/45">Payment Status</span>
              <select
                value={paymentStatusFilter}
                onChange={(event) => setPaymentStatusFilter(event.target.value)}
                className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
              >
                <option value="all">All</option>
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {humanize(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white/90">History Feed</p>
              <p className="text-xs text-white/50">Inspect payment linked ledger movements and references</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">
              {filteredHistory.length} visible
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {filteredHistory.map((entry) => (
              <LedgerHistoryCard key={entry._id} entry={entry} />
            ))}

            {filteredHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-12 text-center text-sm text-white/60">
                No ledger history matches the current search or filters.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminLedgerPageInner() {
  const searchParams = useSearchParams();
  const ledgerId = (searchParams.get("ledgerId") ?? searchParams.get("userId") ?? "").trim();
  const transactionSeed = (searchParams.get("transactionId") ?? "").trim();
  const {
    data: ledger,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetTicketLedgerQuery(ledgerId, {
    skip: !ledgerId,
  });

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.ledger}
        title="Ledger"
        subtitle="Account history for users opened from tickets"
      >
        {!ledgerId ? (
          <div className="card-soft rounded-2xl px-6 py-10 text-center">
            <p className="text-sm font-medium text-white/85">No ledger selected.</p>
            <p className="mt-2 text-sm text-white/55">
              Open this page from a ticket to view the linked ledger.
            </p>
          </div>
        ) : isLoading ? (
          <LedgerSkeleton />
        ) : isError || !ledger ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5">
            <p className="text-sm font-medium text-rose-100">Unable to load ledger activity.</p>
            <p className="mt-2 text-sm text-rose-100/75">Check the selected ledger and try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white/90">Loaded Ledger</p>
                <p className="mt-1 text-xs text-white/50">
                  {transactionSeed ? `Search seeded with ${transactionSeed}` : "Full history loaded"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-xl border border-(--brand)/35 bg-(--brand)/10 px-3.5 py-2 text-sm font-medium text-cyan-100 transition hover:bg-(--brand)/20"
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <LedgerContent ledger={ledger} initialQuery={transactionSeed} />
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}

export default function AdminLedgerPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[linear-gradient(170deg,#040a14_0%,#0c1830_45%,#091328_100%)]">
          <p className="text-sm text-white/60">Loading ledger...</p>
        </main>
      }
    >
      <AdminLedgerPageInner />
    </Suspense>
  );
}
