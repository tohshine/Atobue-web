"use client";

import { useEffect, useMemo, useState } from "react";
import { adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency, prettyDate, RefundRequest, RefundStatus } from "../_lib/data";
import { getRefundEntries, setRefundEntries } from "../_lib/storage";

function statusPill(status: RefundStatus) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";
  if (status === "approved") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }
  if (status === "pending") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }
  return `${common} bg-rose-400/15 text-rose-200`;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);

  useEffect(() => {
    setRefunds(getRefundEntries());
  }, []);

  const pendingRefunds = useMemo(() => refunds.filter((item) => item.status === "pending").length, [refunds]);

  const updateRefundStatus = (id: string, status: RefundStatus) => {
    const nextState = refunds.map((item) => (item.id === id ? { ...item, status } : item));
    setRefunds(nextState);
    setRefundEntries(nextState);
  };

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.refunds}
        title="Refunds"
        subtitle="Approve, reject, and hold refund requests"
      >
        <section className="card-soft rounded-2xl p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold md:text-xl">Refund Center</h2>
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-200">
              {pendingRefunds} pending request(s)
            </span>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Reason</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Channel</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id} className="border-t border-white/10">
                    <td className="px-3 py-3">
                      <p className="font-medium text-white/90">{refund.customer}</p>
                      <p className="text-xs text-white/55">
                        {refund.id} - {refund.reference}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-white/80">{refund.reason}</td>
                    <td className="px-3 py-3 font-medium">{formatCurrency(refund.amount)}</td>
                    <td className="px-3 py-3 text-white/75">{refund.channel}</td>
                    <td className="px-3 py-3 text-white/75">{prettyDate(refund.requestedOn)}</td>
                    <td className="px-3 py-3">
                      <span className={statusPill(refund.status)}>{refund.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100 hover:bg-emerald-400/20"
                          onClick={() => updateRefundStatus(refund.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-rose-300/35 bg-rose-400/10 px-2.5 py-1 text-xs text-rose-100 hover:bg-rose-400/20"
                          onClick={() => updateRefundStatus(refund.id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-amber-300/35 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-100 hover:bg-amber-400/20"
                          onClick={() => updateRefundStatus(refund.id, "pending")}
                        >
                          Hold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AdminShell>
    </AdminGuard>
  );
}
