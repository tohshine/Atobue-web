"use client";

import { adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { formatCurrency } from "../_lib/data";

export default function AdminControlsPage() {
  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.controls}
        title="Controls"
        subtitle="Essential compliance and automation controls"
      >
        <section className="grid gap-4 md:grid-cols-2">
          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Risk & Compliance</h2>
            <p className="mt-2 text-sm text-white/70">Critical actions to keep platform finance operations safe.</p>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Enforce 2-step refund approval for amounts above {formatCurrency(100000)}
              </button>
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Auto-lock suspicious transactions pending compliance review
              </button>
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Generate monthly tax-ready export package
              </button>
            </div>
          </article>

          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Automation Console</h2>
            <p className="mt-2 text-sm text-white/70">Fast-track repetitive reporting and reconciliation workflows.</p>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Enable monthly ledger reconciliation
              </button>
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Auto-flag refunds above {formatCurrency(50000)}
              </button>
              <button className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                Trigger weekly finance summary report
              </button>
            </div>
          </article>
        </section>
      </AdminShell>
    </AdminGuard>
  );
}
