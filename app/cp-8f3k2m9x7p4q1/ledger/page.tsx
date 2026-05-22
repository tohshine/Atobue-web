"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import {
  formatCurrency,
  LedgerEntry,
  prettyDate,
  TransactionStatus,
  TransactionType,
} from "../_lib/data";
import { getLedgerEntries, setLedgerEntries } from "../_lib/storage";
import { AdminUser, getUsers } from "../_lib/users";

function statusPill(status: string) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";
  if (status === "completed") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }
  return `${common} bg-amber-400/15 text-amber-200`;
}

function AdminLedgerPageInner() {
  const searchParams = useSearchParams();
  const [ledgerEntries, setEntries] = useState<LedgerEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<"all" | TransactionType>("all");
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [ledgerUserFilter, setLedgerUserFilter] = useState<"all" | string>("all");

  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newSource, setNewSource] = useState("Bank Transfer");
  const [newType, setNewType] = useState<TransactionType>("inflow");
  const [newStatus, setNewStatus] = useState<TransactionStatus>("pending");
  const [newUserId, setNewUserId] = useState("");

  useEffect(() => {
    setEntries(getLedgerEntries());
    const loadUsers = async () => {
      try {
        const payload = await getUsers();
        setUsers(payload.users);
        if (payload.users.length > 0) {
          setNewUserId(payload.users[0].id);
          const userIdFromQuery = searchParams.get("userId");
          if (userIdFromQuery && payload.users.some((user) => user.id === userIdFromQuery)) {
            setLedgerUserFilter(userIdFromQuery);
          }
          const transactionIdFromQuery = searchParams.get("transactionId");
          if (transactionIdFromQuery) {
            setQuery(transactionIdFromQuery);
          }
        }
      } catch {
        setUsers([]);
      }
    };
    void loadUsers();
  }, [searchParams]);

  const userNameById = useMemo(
    () =>
      users.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.fullName;
        return acc;
      }, {}),
    [users]
  );

  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter((item) => {
      const matchQuery =
        query.length === 0 ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.userId.toLowerCase().includes(query.toLowerCase()) ||
        (userNameById[item.userId] ?? "").toLowerCase().includes(query.toLowerCase());

      const matchType = ledgerTypeFilter === "all" || item.type === ledgerTypeFilter;
      const matchStatus = ledgerStatusFilter === "all" || item.status === ledgerStatusFilter;
      const matchUser = ledgerUserFilter === "all" || item.userId === ledgerUserFilter;

      return matchQuery && matchType && matchStatus && matchUser;
    });
  }, [ledgerEntries, ledgerStatusFilter, ledgerTypeFilter, ledgerUserFilter, query, userNameById]);

  const addLedgerEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(newAmount);
    if (!newDescription.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !newUserId) {
      return;
    }

    const nextEntry: LedgerEntry = {
      id: `TXN-${1000 + ledgerEntries.length + 1}`,
      userId: newUserId,
      description: newDescription.trim(),
      category: newCategory,
      amount: parsedAmount,
      type: newType,
      status: newStatus,
      date: new Date().toISOString().slice(0, 10),
      source: newSource,
    };

    const updatedEntries = [nextEntry, ...ledgerEntries];
    setEntries(updatedEntries);
    setLedgerEntries(updatedEntries);
    setNewDescription("");
    setNewAmount("");
    setNewCategory("General");
    setNewSource("Bank Transfer");
    setNewType("inflow");
    setNewStatus("pending");
  };

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.ledger}
        title="Ledger"
        subtitle="Track inflow and outflow entries"
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
          <section className="card-soft rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold md:text-xl">Add Ledger Entry</h2>
            <form onSubmit={addLedgerEntry} className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Description</span>
                <input
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-(--brand)"
                  placeholder="What was this transaction for?"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Amount (NGN)</span>
                <input
                  type="number"
                  min={1}
                  value={newAmount}
                  onChange={(event) => setNewAmount(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-(--brand)"
                  placeholder="50000"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/60">Linked User</span>
                  <select
                    value={newUserId}
                    onChange={(event) => setNewUserId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                  >
                    {users.length === 0 && <option value="">No users available</option>}
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.id})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/60">Type</span>
                  <select
                    value={newType}
                    onChange={(event) => setNewType(event.target.value as TransactionType)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                  >
                    <option value="inflow">Inflow</option>
                    <option value="outflow">Outflow</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/60">Status</span>
                  <select
                    value={newStatus}
                    onChange={(event) => setNewStatus(event.target.value as TransactionStatus)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/60">Category</span>
                  <select
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                  >
                    <option>General</option>
                    <option>Rent</option>
                    <option>Operations</option>
                    <option>Security</option>
                    <option>Insurance</option>
                    <option>Penalty</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/60">Source</span>
                  <select
                    value={newSource}
                    onChange={(event) => setNewSource(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                  >
                    <option>Bank Transfer</option>
                    <option>Company Account</option>
                    <option>Wallet</option>
                    <option>Card</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-(--brand) px-4 py-2.5 text-sm font-semibold text-slate-900 hover:brightness-110"
              >
                Save Transaction
              </button>
            </form>
          </section>

          <section className="card-soft rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[210px] grow text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-(--brand)"
                  placeholder="Search by ID, description or category"
                />
              </label>
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Type</span>
                <select
                  value={ledgerTypeFilter}
                  onChange={(event) => setLedgerTypeFilter(event.target.value as "all" | TransactionType)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Status</span>
                <select
                  value={ledgerStatusFilter}
                  onChange={(event) => setLedgerStatusFilter(event.target.value as "all" | TransactionStatus)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">User</span>
                <select
                  value={ledgerUserFilter}
                  onChange={(event) => setLedgerUserFilter(event.target.value as "all" | string)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 outline-none focus:border-(--brand)"
                >
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-3 py-2.5">Transaction</th>
                    <th className="px-3 py-2.5">User</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/10">
                      <td className="px-3 py-3">
                        <p className="font-medium text-white/90">{entry.description}</p>
                        <p className="text-xs text-white/55">
                          {entry.id} - {entry.category} - {entry.source}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-white/80">
                        <p>{userNameById[entry.userId] ?? "Unassigned User"}</p>
                        <p className="text-xs text-white/55">{entry.userId}</p>
                      </td>
                      <td className="px-3 py-3 text-white/75">{prettyDate(entry.date)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                            entry.type === "inflow" ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200",
                          ].join(" ")}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium">{formatCurrency(entry.amount)}</td>
                      <td className="px-3 py-3">
                        <span className={statusPill(entry.status)}>{entry.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLedger.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-white/60">No ledger records match your filters.</div>
              )}
            </div>
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

export default function AdminLedgerPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[linear-gradient(170deg,#040a14_0%,#0c1830_45%,#091328_100%)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
            Loading ledger...
          </div>
        </main>
      }
    >
      <AdminLedgerPageInner />
    </Suspense>
  );
}
