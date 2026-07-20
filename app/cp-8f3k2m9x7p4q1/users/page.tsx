"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminLedgerUrl, adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import PaginationBar from "../_components/PaginationBar";
import { useGetUsersQuery } from "@/lib/api";
import type { SystemUser } from "@/lib/types";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

function formatCashAmount(value: string, currency = "NGN") {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback = "",
) {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  if (initials) return initials.toUpperCase();

  const parts = fallback.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "?";
}

function parseCash(value: string) {
  return Number(value) || 0;
}

function UserAvatar({ user }: { user: SystemUser }) {
  const { first_name, last_name } = user.user_info;
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--brand)/30 to-cyan-400/20 text-sm font-semibold text-cyan-100 ring-2 ring-white/10">
      {getInitials(first_name, last_name, user.user_info.fullname)}
    </div>
  );
}

function CashMetric({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: string;
  currency: string;
  tone: "emerald" | "rose" | "cyan";
}) {
  const toneClasses = {
    emerald: "text-emerald-200",
    rose: "text-rose-200",
    cyan: "text-cyan-200",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-white/50">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${toneClasses[tone]}`}>
        {formatCashAmount(value, currency)}
      </p>
    </div>
  );
}

function UserCard({
  user,
  selected,
  onSelect,
}: {
  user: SystemUser;
  selected: boolean;
  onSelect: () => void;
}) {
  const { user_info, cash } = user;
  const netFlow = parseCash(cash.inflow) - parseCash(cash.outflow);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        selected
          ? "border-(--brand) bg-(--brand)/12 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/95">{user_info.fullname}</p>
              <p className="truncate text-xs text-white/55">{user_info.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
              {user_info.currency}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-white/45">
            Joined {formatDate(user_info.createdAt)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] text-emerald-200">
              In {formatCashAmount(cash.inflow, user_info.currency)}
            </span>
            <span className="rounded-full bg-rose-400/12 px-2 py-0.5 text-[10px] text-rose-200">
              Out {formatCashAmount(cash.outflow, user_info.currency)}
            </span>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px]",
                netFlow >= 0 ? "bg-cyan-400/12 text-cyan-200" : "bg-amber-400/12 text-amber-200",
              ].join(" ")}
            >
              Net {formatCashAmount(String(netFlow), user_info.currency)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function UserDetailPanel({ user }: { user: SystemUser }) {
  const { user_info, cash } = user;
  const inflow = parseCash(cash.inflow);
  const outflow = parseCash(cash.outflow);
  const totalInflow = parseCash(cash.total_inflow);
  const netFlow = inflow - outflow;
  const inflowShare = totalInflow > 0 ? Math.round((inflow / totalInflow) * 100) : 0;

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-(--brand)/25 to-cyan-500/15 text-lg font-semibold text-cyan-100">
            {getInitials(user_info.first_name, user_info.last_name, user_info.fullname)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-white/50">Account Holder</p>
            <h2 className="mt-1 text-xl font-semibold text-white/95">{user_info.fullname}</h2>
            <p className="mt-1 text-sm text-white/65">{user_info.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/75">
                {user_info.currency}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/60">
                Member since {formatDate(user_info.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/45">
          {user_info._id}
        </p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Cash Position</h3>
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              netFlow >= 0
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-amber-400/15 text-amber-200",
            ].join(" ")}
          >
            {netFlow >= 0 ? "Positive balance" : "Negative balance"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <CashMetric label="Inflow" value={cash.inflow} currency={user_info.currency} tone="emerald" />
          <CashMetric label="Outflow" value={cash.outflow} currency={user_info.currency} tone="rose" />
          <CashMetric
            label="Total Inflow"
            value={cash.total_inflow}
            currency={user_info.currency}
            tone="cyan"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Inflow vs total inflow</span>
            <span>{inflowShare}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-(--brand) to-cyan-300 transition-all"
              style={{ width: `${Math.min(inflowShare, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/8 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-emerald-200/70">Net Cashflow</p>
            <p className="mt-1 text-lg font-semibold text-emerald-100">
              {formatCashAmount(String(netFlow), user_info.currency)}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/8 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-cyan-200/70">Lifetime Inflow</p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              {formatCashAmount(cash.total_inflow, user_info.currency)}
            </p>
          </div>
        </div>
      </article>

      <Link
        href={adminLedgerUrl(user_info._id)}
        className="inline-flex w-full items-center justify-center rounded-xl border border-(--brand)/35 bg-(--brand)/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-(--brand)/20"
      >
        View Ledger for {user_info.first_name ?? user_info.fullname}
      </Link>
    </div>
  );
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error: fetchError } = useGetUsersQuery({ p: page });
  const users = data?.items ?? [];
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const error = fetchError ? "Failed to load users." : null;

  useEffect(() => {
    setSelectedId("");
  }, [page]);

  useEffect(() => {
    if (users.length > 0 && !selectedId) {
      setSelectedId(users[0].user_info._id);
    }
  }, [users, selectedId]);

  const filteredUsers = useMemo(() => {
    const searchText = query.toLowerCase().trim();
    if (!searchText) {
      return users;
    }

    return users.filter((user) => {
      const { user_info } = user;
      return (
        user_info.fullname.toLowerCase().includes(searchText) ||
        user_info.email.toLowerCase().includes(searchText) ||
        user_info._id.toLowerCase().includes(searchText) ||
        (user_info.first_name ?? "").toLowerCase().includes(searchText) ||
        (user_info.last_name ?? "").toLowerCase().includes(searchText)
      );
    });
  }, [users, query]);

  const selectedUser =
    users.find((user) => user.user_info._id === selectedId) ?? filteredUsers[0] ?? null;

  const aggregateStats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.totalInflow += parseCash(user.cash.inflow);
        acc.totalOutflow += parseCash(user.cash.outflow);
        acc.lifetimeInflow += parseCash(user.cash.total_inflow);
        return acc;
      },
      { totalInflow: 0, totalOutflow: 0, lifetimeInflow: 0 },
    );
  }, [users]);

  const activeUsers = users.filter(
    (user) => parseCash(user.cash.inflow) > 0 || parseCash(user.cash.outflow) > 0,
  ).length;

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.users}
        title="Users"
        subtitle="Browse platform accounts and monitor cash activity"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{data?.total ?? users.length}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">With Cash Activity</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">{activeUsers}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Platform Inflow</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {formatCashAmount(String(aggregateStats.totalInflow))}
            </p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Platform Outflow</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">
              {formatCashAmount(String(aggregateStats.totalOutflow))}
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="card-soft rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">User Directory</h2>
                <p className="mt-1 text-xs text-white/55">
                  {filteredUsers.length} on this page
                  {isFetching ? " · syncing…" : ""}
                </p>
              </div>
              <label className="min-w-[220px] grow text-sm lg:max-w-xs">
                <span className="text-xs uppercase tracking-wide text-white/60">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, email, or user ID"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-(--brand)"
                />
              </label>
            </div>

            {isLoading && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/70">
                Loading users...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <div className="mt-5 space-y-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.user_info._id}
                    user={user}
                    selected={selectedUser?.user_info._id === user.user_info._id}
                    onSelect={() => setSelectedId(user.user_info._id)}
                  />
                ))}

                {filteredUsers.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
                    No users match your search.
                  </div>
                )}

                <PaginationBar
                  page={data?.page ?? page}
                  pageCount={data?.pageCount ?? null}
                  hasMore={data?.hasMore ?? false}
                  total={data?.total ?? null}
                  itemCount={filteredUsers.length}
                  onPageChange={setPage}
                  disabled={isFetching}
                />
              </div>
            )}
          </section>

          <section className="card-soft rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold">Account Details</h2>
            <p className="mt-1 text-xs text-white/55">Profile and cash summary for the selected user</p>

            {!selectedUser && !isLoading && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-12 text-center text-sm text-white/60">
                Select a user to view their account details.
              </div>
            )}

            {selectedUser && (
              <div className="mt-5">
                <UserDetailPanel user={selectedUser} />
              </div>
            )}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
