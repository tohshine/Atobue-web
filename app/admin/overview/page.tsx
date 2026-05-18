"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency, LedgerEntry, RefundRequest } from "../_lib/data";
import { getLedgerEntries, getRefundEntries } from "../_lib/storage";
import { getUsers } from "../_lib/users";

export default function AdminOverviewPage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    setLedgerEntries(getLedgerEntries());
    setRefunds(getRefundEntries());
    const loadUsers = async () => {
      try {
        const payload = await getUsers();
        setTotalUsers(payload.total);
      } catch {
        setTotalUsers(0);
      }
    };
    void loadUsers();
  }, []);

  const totalInflow = useMemo(
    () =>
      ledgerEntries
        .filter((item) => item.type === "inflow" && item.status === "completed")
        .reduce((sum, item) => sum + item.amount, 0),
    [ledgerEntries]
  );

  const totalOutflow = useMemo(
    () =>
      ledgerEntries
        .filter((item) => item.type === "outflow" && item.status === "completed")
        .reduce((sum, item) => sum + item.amount, 0),
    [ledgerEntries]
  );

  const pendingTransactions = useMemo(
    () => ledgerEntries.filter((item) => item.status === "pending").length,
    [ledgerEntries]
  );

  const pendingRefunds = useMemo(() => refunds.filter((item) => item.status === "pending").length, [refunds]);
  const netCashFlow = totalInflow - totalOutflow;
  const refundExposure = useMemo(
    () =>
      refunds
        .filter((item) => item.status === "pending")
        .reduce((sum, item) => sum + item.amount, 0),
    [refunds]
  );

  return (
    <AdminGuard>
      <AdminShell
        active="/admin/overview"
        title="Overview"
        subtitle="Finance health at a glance"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Completed Inflow</p>
            <p className="mt-3 text-2xl font-semibold">{formatCurrency(totalInflow)}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Completed Outflow</p>
            <p className="mt-3 text-2xl font-semibold">{formatCurrency(totalOutflow)}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Net Cashflow</p>
            <p className={["mt-3 text-2xl font-semibold", netCashFlow >= 0 ? "text-emerald-300" : "text-rose-300"].join(" ")}>
              {formatCurrency(netCashFlow)}
            </p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Pending Refund Exposure</p>
            <p className="mt-3 text-2xl font-semibold text-amber-200">{formatCurrency(refundExposure)}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Operations Signal</h3>
            <p className="mt-3 text-sm text-white/80">
              {pendingTransactions} ledger item(s) are pending and should be reconciled quickly.
            </p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Refund Queue</h3>
            <p className="mt-3 text-sm text-white/80">
              {pendingRefunds} request(s) await a decision from the finance team.
            </p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Cash Position</h3>
            <p className="mt-3 text-sm text-white/80">
              {netCashFlow >= 0 ? "Positive trend this cycle. Keep controls active." : "Negative trend detected, review outflow policy."}
            </p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Platform Users</h3>
            <p className="mt-3 text-sm text-white/80">{totalUsers} user account(s) currently in system.</p>
          </article>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
