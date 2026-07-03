"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { adminRoutes } from "@/lib/admin-path";
import { useGetRefundOrderDetailQuery, useGetRefundOrdersQuery } from "@/lib/api";
import type {
  RefundOrderDetail,
  RefundOrderListItem,
  RefundStatus,
  RefundUserProfile,
  RefundVacancyReference,
} from "@/lib/types";
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
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusPill(status: RefundStatus | string | null | undefined) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium";
  const normalized = status?.toLowerCase();

  if (normalized === "cleared" || normalized === "success") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }

  if (normalized === "pending" || normalized === "processing") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }

  if (normalized === "failed" || normalized === "rejected") {
    return `${common} bg-rose-400/15 text-rose-200`;
  }

  return `${common} bg-cyan-400/15 text-cyan-200`;
}

function getRefundOwnerName(owner: string | RefundUserProfile) {
  return typeof owner === "string" ? owner : owner.fullname;
}

function getRefundOwnerId(owner: string | RefundUserProfile) {
  return typeof owner === "string" ? owner : owner._id;
}

function getRefundVacancyId(vacancy: string | RefundVacancyReference) {
  return typeof vacancy === "string" ? vacancy : vacancy._id;
}

function getRefundVacancyTitle(vacancy: string | RefundVacancyReference | null | undefined) {
  if (!vacancy) {
    return "Not available";
  }

  return typeof vacancy === "string" ? vacancy : vacancy.title;
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "rose" | "amber" | "cyan";
}) {
  const toneClasses = {
    emerald: "text-emerald-200",
    rose: "text-rose-200",
    amber: "text-amber-200",
    cyan: "text-cyan-200",
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/6 blur-3xl" />
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
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

function RefundQueueCard({
  refund,
  selected,
  onSelect,
}: {
  refund: RefundOrderListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition",
        selected
          ? "border-(--brand) bg-(--brand)/12 shadow-[0_0_0_1px_rgba(45,179,255,0.18)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/70">
              {refund.id}
            </span>
            <span className={statusPill(refund.status)}>{humanize(refund.status)}</span>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white/95">{formatMoney(refund.amount)}</h3>
          <p className="mt-1 text-xs text-white/55">{humanize(refund.type)}</p>
        </div>
        <span className="rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-medium text-cyan-100">
          {refund.breakdown.currency}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-wide text-white/40">Refund Source</p>
        <p className="mt-1 break-all text-sm text-white/85">{getRefundOwnerName(refund.from)}</p>
        <p className="text-sm text-white/55">Payment {refund.payment_id}</p>
      </div>

      <div className="mt-3 flex flex-col items-start gap-2 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span>Clears {formatDateTime(refund.clearance_time ?? refund.resolve_after)}</span>
        <span>{formatDateTime(refund.createdAt)}</span>
      </div>
    </button>
  );
}

function RefundDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-44 rounded-3xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-52 rounded-2xl bg-white/5" />
        <div className="h-52 rounded-2xl bg-white/5" />
      </div>
      <div className="h-72 rounded-2xl bg-white/5" />
    </div>
  );
}

function RefundDetailPanel({ refund, isRefreshing }: { refund: RefundOrderDetail; isRefreshing: boolean }) {
  const breakdown = refund.breakdown;
  const currency = breakdown.currency;

  return (
    <div className="space-y-4">
      <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-(--brand)/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75">
                {refund.id}
              </span>
              <span className={statusPill(refund.status)}>{humanize(refund.status)}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                {humanize(refund.type)}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {formatMoney(refund.amount, currency)} refund order
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Review the refund owner, linked vacancy, payment breakdown, and settlement timestamps for this order.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-wide text-white/45">Refresh State</p>
            <p className="mt-1 text-sm text-white/70">{isRefreshing ? "Refreshing..." : "Live"}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wide text-white/45">Created</p>
            <p className="mt-1 text-sm text-white/90">{formatDateTime(refund.createdAt)}</p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <article className="card-soft rounded-2xl p-5 md:p-6">
            <h3 className="text-base font-semibold">Refund Owner</h3>
            <div className="mt-4 flex flex-wrap items-start gap-4">
              <Image
                src={refund.from.profile_photo}
                alt={refund.from.fullname}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-white/95">{refund.from.fullname}</p>
                <p className="text-sm text-white/60">
                  {refund.from.first_name} {refund.from.last_name}
                </p>
                <p className="mt-2 break-all font-mono text-xs text-white/45">{refund.from._id}</p>
              </div>
            </div>
          </article>

          <article className="card-soft rounded-2xl p-5 md:p-6">
            <h3 className="text-base font-semibold">Breakdown</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Commitment Amount" value={formatMoney(breakdown.commitment_amount, currency)} />
              <InfoCard label="Refund Amount" value={formatMoney(breakdown.refund_amount, currency)} />
              <InfoCard label="Platform Fee" value={formatMoney(breakdown.platform_fee, currency)} />
              <InfoCard label="Refund Percentage" value={`${breakdown.refund_percentage}%`} />
              <InfoCard label="Decline Reason" value={humanize(breakdown.decline_reason)} />
              <InfoCard label="Commitment Payment Id" value={breakdown.commitment_payment_id} />
            </div>
          </article>

          <article className="card-soft rounded-2xl p-5 md:p-6">
            <h3 className="text-base font-semibold">Linked References</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Payment Id" value={refund.payment_id} />
              <InfoCard label="Enquiry Id" value={refund.enquiry_id} />
              <InfoCard
                label="Vacancy Id"
                value={refund.vacancy_id ? getRefundVacancyId(refund.vacancy_id) : "Not available"}
              />
              <InfoCard label="Vacancy Title" value={getRefundVacancyTitle(refund.vacancy_id)} />
            </div>
          </article>
        </div>

        <div className="space-y-4">
          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-base font-semibold">Settlement Timeline</h3>
            <div className="mt-4 grid gap-3">
              <InfoCard label="Success Time" value={formatDateTime(refund.success_time)} />
              <InfoCard label="Resolve After" value={formatDateTime(refund.resolve_after)} />
              <InfoCard label="Cleared At" value={formatDateTime(refund.clearance_time)} />
              <InfoCard label="Updated At" value={formatDateTime(refund.updatedAt)} />
            </div>
          </article>

          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-base font-semibold">Admin Review</h3>
            <div className="mt-4 grid gap-3">
              <InfoCard label="Current Status" value={humanize(refund.status)} />
              <InfoCard label="Admin Action" value={refund.admin_action ?? "No admin action recorded"} />
              <InfoCard label="Order Id" value={refund._id} />
              <InfoCard label="Type" value={humanize(refund.type)} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default function AdminRefundsPage() {
  const {
    data: refunds = [],
    isLoading,
    isError: isListError,
    refetch: refetchList,
    isFetching: isRefreshingList,
  } = useGetRefundOrdersQuery();

  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRefunds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesQuery =
        !normalizedQuery ||
        refund.id.toLowerCase().includes(normalizedQuery) ||
        refund._id.toLowerCase().includes(normalizedQuery) ||
        getRefundOwnerName(refund.from).toLowerCase().includes(normalizedQuery) ||
        getRefundOwnerId(refund.from).toLowerCase().includes(normalizedQuery) ||
        refund.payment_id.toLowerCase().includes(normalizedQuery) ||
        refund.enquiry_id.toLowerCase().includes(normalizedQuery) ||
        getRefundVacancyId(refund.vacancy_id).toLowerCase().includes(normalizedQuery) ||
        getRefundVacancyTitle(refund.vacancy_id).toLowerCase().includes(normalizedQuery) ||
        refund.type.toLowerCase().includes(normalizedQuery) ||
        (refund.breakdown.decline_reason ?? "").toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || refund.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, refunds, statusFilter]);

  const selectedId = useMemo(() => {
    if (filteredRefunds.length === 0) {
      return "";
    }

    const hasManualSelection = manualSelectedId
      ? filteredRefunds.some((refund) => refund._id === manualSelectedId)
      : false;

    return hasManualSelection && manualSelectedId ? manualSelectedId : filteredRefunds[0]._id;
  }, [filteredRefunds, manualSelectedId]);

  const {
    data: selectedRefund,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
    isFetching: isRefreshingDetail,
  } = useGetRefundOrderDetailQuery(selectedId, {
    skip: !selectedId,
  });

  const totalRefunds = refunds.length;
  const clearedRefunds = refunds.filter((refund) => refund.status.toLowerCase() === "cleared").length;
  const pendingRefunds = refunds.filter((refund) => refund.status.toLowerCase() === "pending").length;
  const totalRefundAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(refunds.map((refund) => refund.status))).sort();
  }, [refunds]);

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.refunds}
        title="Refund Command Center"
        subtitle="Review refund orders, inspect payout breakdowns, and drill into each refund case"
      >
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6 md:p-7">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-(--brand)/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Refund Orders</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  A polished desk for customer refund operations
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  The queue is powered by <code>/admin/orders/refunds</code>, and the active case panel
                  hydrates from <code>/admin/orders/refunds/:orderId</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  refetchList();
                  if (selectedId) {
                    refetchDetail();
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-(--brand)/35 bg-(--brand)/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-(--brand)/20"
              >
                {isRefreshingList || isRefreshingDetail ? "Refreshing..." : "Refresh refunds"}
              </button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Refunds" value={totalRefunds} tone="cyan" />
            <MetricCard label="Cleared Orders" value={clearedRefunds} tone="emerald" />
            <MetricCard label="Pending Orders" value={pendingRefunds} tone="amber" />
            <MetricCard label="Total Value" value={formatMoney(totalRefundAmount)} tone="rose" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
            <section className="card-soft rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Refund Queue</h3>
                  <p className="mt-1 text-sm text-white/55">
                    Search by ids, source user, payment, enquiry, vacancy, or reason.
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">
                  {filteredRefunds.length} visible
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/45">Search</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search refunds..."
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-(--brand)"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/45">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
                  >
                    <option value="all">All</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {humanize(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {isLoading ? (
                <div className="mt-5 space-y-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-40 rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : isListError ? (
                <div className="mt-5 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5 text-sm text-rose-100">
                  <p>Unable to load refund orders.</p>
                  <button
                    type="button"
                    onClick={() => refetchList()}
                    className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
                  >
                    Retry request
                  </button>
                </div>
              ) : filteredRefunds.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
                  No refund orders match the current search or filters.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {filteredRefunds.map((refund) => (
                    <RefundQueueCard
                      key={refund._id}
                      refund={refund}
                      selected={refund._id === selectedId}
                      onSelect={() => setManualSelectedId(refund._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              {!selectedId && !isLoading ? (
                <div className="card-soft rounded-2xl px-4 py-16 text-center text-sm text-white/60">
                  Select a refund order to inspect the full refund case.
                </div>
              ) : isDetailLoading ? (
                <RefundDetailSkeleton />
              ) : isDetailError || !selectedRefund ? (
                <div className="card-soft rounded-2xl p-6">
                  <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5 text-sm text-rose-100">
                    <p>Unable to load this refund order.</p>
                    <button
                      type="button"
                      onClick={() => refetchDetail()}
                      className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
                    >
                      Retry detail request
                    </button>
                  </div>
                </div>
              ) : (
                <RefundDetailPanel refund={selectedRefund} isRefreshing={isRefreshingDetail} />
              )}
            </section>
          </div>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
