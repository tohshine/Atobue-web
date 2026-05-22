"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminLedgerUrl, adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency, LedgerEntry } from "../_lib/data";
import { getLedgerEntries } from "../_lib/storage";
import { AdminUser, getUsers } from "../_lib/users";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

function statusPill(status: AdminUser["status"]) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";
  if (status === "active") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }
  if (status === "inactive") {
    return `${common} bg-slate-400/20 text-slate-200`;
  }
  return `${common} bg-rose-400/15 text-rose-200`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUser["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const payload = await getUsers();
        setUsers(payload.users);
        setLedgerEntries(getLedgerEntries());
        setError(null);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = query.toLowerCase();
      const matchQuery =
        query.length === 0 ||
        user.fullName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.id.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText);
      const matchStatus = statusFilter === "all" || user.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [users, query, statusFilter]);

  const activeCount = users.filter((user) => user.status === "active").length;
  const linkedLedgerCount = ledgerEntries.filter((entry) => Boolean(entry.userId)).length;

  const ledgerStatsByUser = useMemo(() => {
    return ledgerEntries.reduce<Record<string, { count: number; inflow: number; outflow: number }>>((acc, entry) => {
      const current = acc[entry.userId] ?? { count: 0, inflow: 0, outflow: 0 };
      current.count += 1;
      if (entry.type === "inflow") {
        current.inflow += entry.amount;
      } else {
        current.outflow += entry.amount;
      }
      acc[entry.userId] = current;
      return acc;
    }, {});
  }, [ledgerEntries]);

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.users}
        title="Users"
        subtitle="Get users and monitor account health"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{users.length}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Active Users</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{activeCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Linked Ledger Records</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">{linkedLedgerCount}</p>
          </article>
        </div>

        <section className="card-soft mt-6 rounded-2xl p-5 md:p-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] grow text-sm">
              <span className="text-xs uppercase tracking-wide text-white/60">Search</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, role or user id"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-(--brand)"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs uppercase tracking-wide text-white/60">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | AdminUser["status"])}
                className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {loading && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
              Loading users...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-3 py-2.5">User</th>
                    <th className="px-3 py-2.5">Role</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Joined</th>
                    <th className="px-3 py-2.5">Last Seen</th>
                    <th className="px-3 py-2.5">Ledger Linked</th>
                    <th className="px-3 py-2.5">Inflow</th>
                    <th className="px-3 py-2.5">Outflow</th>
                    <th className="px-3 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const ledgerStats = ledgerStatsByUser[user.id] ?? { count: 0, inflow: 0, outflow: 0 };
                    return (
                      <tr key={user.id} className="border-t border-white/10">
                        <td className="px-3 py-3">
                          <p className="font-medium text-white/90">{user.fullName}</p>
                          <p className="text-xs text-white/55">
                            {user.email} - {user.id}
                          </p>
                        </td>
                        <td className="px-3 py-3 capitalize text-white/80">{user.role}</td>
                        <td className="px-3 py-3">
                          <span className={statusPill(user.status)}>{user.status}</span>
                        </td>
                        <td className="px-3 py-3 text-white/75">{formatDate(user.joinedAt)}</td>
                        <td className="px-3 py-3 text-white/75">{formatDate(user.lastSeen)}</td>
                        <td className="px-3 py-3 font-medium text-white/80">{ledgerStats.count}</td>
                        <td className="px-3 py-3 font-medium text-emerald-200">{formatCurrency(ledgerStats.inflow)}</td>
                        <td className="px-3 py-3 font-medium text-rose-200">{formatCurrency(ledgerStats.outflow)}</td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Link
                            href={adminLedgerUrl(user.id)}
                            className="inline-flex min-w-[96px] items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/90 transition hover:bg-white/10"
                          >
                            View Ledger
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-white/60">No users match your filter.</div>
              )}
            </div>
          )}
        </section>
      </AdminShell>
    </AdminGuard>
  );
}
