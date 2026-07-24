"use client";

import { useEffect, useState } from "react";
import { adminRoutes } from "@/lib/admin-path";
import { useGetSystemInfoQuery } from "@/lib/api";
import type { SystemCashMetrics, SystemUserMetrics } from "@/lib/types";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency, prettyDate } from "../_lib/data";
import { getBalanceHidden, setBalanceHidden } from "../_lib/storage";

const HIDDEN_BALANCE = "••••••";

const EMPTY_CASH: SystemCashMetrics = {
  completed_inflow: 0,
  completed_outflow: 0,
  net_cashflow: 0,
  pending_refund_exposure: 0,
  account_balance: 0,
};

const EMPTY_USERS: SystemUserMetrics = {
  total_users: 0,
  active_users: 0,
};

function formatBalance(amount: number, hidden: boolean) {
  return hidden ? HIDDEN_BALANCE : formatCurrency(amount);
}

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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2M6.7 6.7C4.1 8.4 2 12 2 12a18.5 18.5 0 0 0 6.4 5.6M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BalanceVisibilityToggle({
  hidden,
  onToggle,
}: {
  hidden: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Show balance" : "Hide balance"}
      title={hidden ? "Show balance" : "Hide balance"}
      className="inline-flex items-center gap-1.5 rounded-full border border-fg-10 bg-surface-5 px-3 py-1.5 text-xs font-medium text-fg-70 transition hover:bg-surface-10 hover:text-fg"
    >
      {hidden ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
      {hidden ? "Show balance" : "Hide balance"}
    </button>
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
    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition hover:border-white/20 hover:bg-white/[0.07]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-white/45">{sublabel}</p> : null}
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
    <div className="animate-pulse space-y-5">
      <div className="h-10 rounded-2xl bg-white/5" />
      <div className="h-24 rounded-2xl bg-white/5" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-52 rounded-2xl bg-white/5" />
        <div className="h-52 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: system, isLoading, isError, refetch, isFetching } = useGetSystemInfoQuery();
  const [balanceHidden, setBalanceHiddenState] = useState(false);

  useEffect(() => {
    setBalanceHiddenState(getBalanceHidden());
  }, []);

  const toggleBalanceVisibility = () => {
    setBalanceHiddenState((current) => {
      const next = !current;
      setBalanceHidden(next);
      return next;
    });
  };

  const cash = system?.cash ?? EMPTY_CASH;
  const users = system?.users ?? EMPTY_USERS;
  const netCashflow = cash.net_cashflow;
  const totalUsers = users.total_users;
  const activeUsers = users.active_users;
  const inactiveUsers = Math.max(totalUsers - activeUsers, 0);
  const activeRatio = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.overview}
        title="Overview"
        subtitle="Platform health and financial position"
      >
        {isLoading ? (
          <OverviewSkeleton />
        ) : isError || !system ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-center">
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
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ul className="flex flex-wrap items-center gap-2" aria-label="Overview keywords">
                {["Balance", "Cashflow", "Users", "Health"].map((word) => (
                  <li
                    key={word}
                    className="pill border border-white/10 bg-white/6 px-3 py-1 text-[11px] tracking-[0.12em] text-white/70 uppercase"
                  >
                    {word}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  Updated {formatDateTime(system.updatedAt)}
                </span>
                {isFetching ? (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                    Syncing
                  </span>
                ) : null}
              </div>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/50">Account Balance</p>
                  <BalanceVisibilityToggle hidden={balanceHidden} onToggle={toggleBalanceVisibility} />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {formatBalance(cash.account_balance, balanceHidden)}
              </p>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Net position after completed flows, with{" "}
                <span className="font-medium text-amber-200">
                  {formatBalance(cash.pending_refund_exposure, balanceHidden)}
                </span>{" "}
                in pending refund exposure.
              </p>
            </section>

            <section className="space-y-3">
              <SectionHeader
                icon={<CashIcon className="h-5 w-5" />}
                title="Cash Flow"
                description="Completed movements and net liquidity"
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Completed Inflow"
                  value={formatBalance(cash.completed_inflow, balanceHidden)}
                  tone="positive"
                />
                <MetricCard
                  label="Completed Outflow"
                  value={formatBalance(cash.completed_outflow, balanceHidden)}
                  tone="negative"
                />
                <MetricCard
                  label="Net Cashflow"
                  value={formatBalance(netCashflow, balanceHidden)}
                  tone={netCashflow >= 0 ? "positive" : "negative"}
                  sublabel={balanceHidden ? undefined : netCashflow >= 0 ? "Positive cycle" : "Review outflow policy"}
                />
                <MetricCard
                  label="Pending Refund Exposure"
                  value={formatBalance(cash.pending_refund_exposure, balanceHidden)}
                  tone="warning"
                />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <SectionHeader
                  icon={<UsersIcon className="h-5 w-5" />}
                  title="User Base"
                  description="Registered accounts and current activity"
                />
                <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                  <ActiveUserRing active={activeUsers} total={totalUsers} />
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Total Users</p>
                      <p className="mt-1 text-xl font-semibold text-white">{totalUsers}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Active Users</p>
                      <p className="mt-1 text-xl font-semibold text-cyan-200">{activeUsers}</p>
                      <p className="mt-1 text-xs text-white/45">{activeRatio}% of total base</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Inactive Users</p>
                      <p className="mt-1 text-xl font-semibold text-white/80">{inactiveUsers}</p>
                      <p className="mt-1 text-xs text-white/45">No recent platform activity</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/3 p-5">
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
                  title="System Health"
                  description="Live status and sync timing"
                />
                <dl className="mt-5 space-y-3">
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
                      {balanceHidden
                        ? "Financial amounts are hidden."
                        : cash.pending_refund_exposure > 0
                          ? `${formatCurrency(cash.pending_refund_exposure)} in refunds requires monitoring.`
                          : netCashflow >= 0
                            ? "Cash position is stable with no pending refund pressure."
                            : "Negative net cashflow detected. Review recent outflows."}
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
