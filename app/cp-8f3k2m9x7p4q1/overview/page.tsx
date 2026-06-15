"use client";

import { adminRoutes } from "@/lib/admin-path";
import { useGetSystemInfoQuery } from "@/lib/api";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency, prettyDate } from "../_lib/data";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function CashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
  sublabel,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "warning" | "accent";
  sublabel?: string;
}) {
  const toneClasses = {
    default: "text-white",
    positive: "text-emerald-300",
    negative: "text-rose-300",
    warning: "text-amber-200",
    accent: "text-cyan-200",
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-(--brand)/10 blur-2xl transition group-hover:bg-(--brand)/20" />
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
      {sublabel ? <p className="mt-2 text-xs text-white/45">{sublabel}</p> : null}
    </article>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-(--brand)">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">{title}</h2>
        <p className="mt-0.5 text-xs text-white/45">{description}</p>
      </div>
    </div>
  );
}

function ActiveUserRing({ active, total }: { active: number; total: number }) {
  const ratio = total > 0 ? active / total : 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - ratio);

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <svg className="-rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold text-white">{active}</p>
        <p className="text-[10px] uppercase tracking-wide text-white/45">Active</p>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 rounded-3xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: system, isLoading, isError, refetch, isFetching } = useGetSystemInfoQuery();

  const cash = system?.cash;
  const users = system?.users;
  const netCashflow = cash?.net_cashflow ?? 0;
  const activeRatio =
    users && users.total_users > 0
      ? Math.round((users.active_users / users.total_users) * 100)
      : 0;

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.overview}
        title="System Overview"
        subtitle="Live platform health and financial position"
      >
        {isLoading ? (
          <OverviewSkeleton />
        ) : isError || !system || !cash || !users ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-8 text-center">
            <p className="text-sm font-medium text-rose-100">Unable to load system information.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-(--brand)/15 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/50">Account Balance</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    {formatCurrency(cash.account_balance)}
                  </p>
                  <p className="mt-3 max-w-md text-sm text-white/60">
                    Net position after completed flows, with{" "}
                    <span className="font-medium text-amber-200">
                      {formatCurrency(cash.pending_refund_exposure)}
                    </span>{" "}
                    in pending refund exposure.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/50">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    Last updated {formatDateTime(system.updatedAt)}
                  </span>
                  {isFetching ? (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                      Syncing…
                    </span>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                icon={<CashIcon className="h-5 w-5" />}
                title="Cash Flow"
                description="Completed movements and net liquidity"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Completed Inflow" value={formatCurrency(cash.completed_inflow)} tone="positive" />
                <MetricCard label="Completed Outflow" value={formatCurrency(cash.completed_outflow)} tone="negative" />
                <MetricCard
                  label="Net Cashflow"
                  value={formatCurrency(netCashflow)}
                  tone={netCashflow >= 0 ? "positive" : "negative"}
                  sublabel={netCashflow >= 0 ? "Positive cycle" : "Review outflow policy"}
                />
                <MetricCard
                  label="Pending Refund Exposure"
                  value={formatCurrency(cash.pending_refund_exposure)}
                  tone="warning"
                />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/3 p-6">
                <SectionHeader
                  icon={<UsersIcon className="h-5 w-5" />}
                  title="User Base"
                  description="Registered accounts and current activity"
                />
                <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                  <ActiveUserRing active={users.active_users} total={users.total_users} />
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Total Users</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{users.total_users}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Active Users</p>
                      <p className="mt-1 text-2xl font-semibold text-cyan-200">{users.active_users}</p>
                      <p className="mt-1 text-xs text-white/45">{activeRatio}% of total base</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/3 p-6">
                <SectionHeader
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  title="System Record"
                  description="Platform snapshot metadata"
                />
                <dl className="mt-8 space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wide text-white/45">Record ID</dt>
                    <dd className="truncate font-mono text-xs text-white/70">{system.id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wide text-white/45">Created</dt>
                    <dd className="text-sm text-white/80">{prettyDate(system.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wide text-white/45">Last Sync</dt>
                    <dd className="text-sm text-white/80">{formatDateTime(system.updatedAt)}</dd>
                  </div>
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">Health Signal</p>
                    <p className="mt-2 text-sm text-white/70">
                      {cash.pending_refund_exposure > 0
                        ? `${formatCurrency(cash.pending_refund_exposure)} in refunds requires monitoring.`
                        : netCashflow >= 0
                          ? "Cash position is stable with no pending refund pressure."
                          : "Negative net cashflow detected — review recent outflows."}
                    </p>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
