"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminLedgerUrl, adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import ChatThread from "../_components/ChatThread";
import { formatCurrency } from "../_lib/data";
import {
  ConflictItem,
  ConflictStatus,
  ConflictTicketType,
  RESOLUTION_ACTION_LABELS,
  ResolutionAction,
  VacancyStatus,
} from "../_lib/conflicts";
import { useGetConflictsQuery, useResolveConflictMutation } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ticketTypePill(type: ConflictTicketType) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  return type === "decline"
    ? `${common} bg-rose-400/15 text-rose-200`
    : `${common} bg-amber-400/15 text-amber-200`;
}

function severityPill(severity: ConflictItem["severity"]) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  if (severity === "high") return `${common} bg-rose-400/15 text-rose-200`;
  if (severity === "medium") return `${common} bg-amber-400/15 text-amber-200`;
  return `${common} bg-emerald-400/15 text-emerald-200`;
}

function statusPill(status: ConflictStatus) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  if (status === "resolved") return `${common} bg-emerald-400/15 text-emerald-200`;
  if (status === "escalated") return `${common} bg-violet-400/15 text-violet-200`;
  return `${common} bg-amber-400/15 text-amber-200`;
}

function vacancyStatusPill(status: VacancyStatus) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";
  if (status === "approved" || status === "agreed") return `${common} bg-emerald-400/15 text-emerald-200`;
  if (status === "declined") return `${common} bg-rose-400/15 text-rose-200`;
  if (status === "committed") return `${common} bg-cyan-400/15 text-cyan-200`;
  return `${common} bg-amber-400/15 text-amber-200`;
}

function roleBadge(role: string) {
  const common = "rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/70";
  return `${common} ${role}`;
}

function PartyCard({
  label,
  profile,
  ledgerHref,
}: {
  label: string;
  profile: ConflictItem["tenant"];
  ledgerHref: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white/90">{profile.fullName}</p>
      <p className="text-xs text-white/60">{profile.email}</p>
      <p className="text-xs text-white/60">{profile.phone}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={roleBadge(profile.role)}>{profile.role}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] capitalize text-white/70">
          {profile.status}
        </span>
        <span className="text-[10px] text-white/45">{profile.id}</span>
      </div>
      <Link
        href={ledgerHref}
        className="mt-3 inline-flex rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/90 transition hover:bg-white/10"
      >
        View Ledger
      </Link>
    </article>
  );
}

function getSuggestedActions(conflict: ConflictItem): ResolutionAction[] {
  if (conflict.ticketType === "decline") {
    return ["refund_commitment", "escalate"];
  }
  return ["refund_commitment", "dismiss_report", "escalate"];
}

export default function AdminConflictsPage() {
  const { data, isLoading, error: fetchError } = useGetConflictsQuery();
  const [resolveConflictMutation, { isLoading: resolving, isError: resolveFailed }] =
    useResolveConflictMutation();
  const conflicts = data?.conflicts ?? [];
  const [selectedId, setSelectedId] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ConflictTicketType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ConflictStatus>("all");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const error = fetchError
    ? "Unable to load conflict resolution center."
    : resolveFailed
      ? "Failed to apply resolution."
      : null;

  useEffect(() => {
    if (conflicts.length > 0 && !selectedId) {
      setSelectedId(conflicts[0].id);
    }
  }, [conflicts, selectedId]);

  const filteredConflicts = useMemo(() => {
    return conflicts.filter((item) => {
      const matchType = typeFilter === "all" || item.ticketType === typeFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [conflicts, typeFilter, statusFilter]);

  const selectedConflict =
    conflicts.find((item) => item.id === selectedId) ?? filteredConflicts[0] ?? null;

  useEffect(() => {
    setResolutionNotes("");
  }, [selectedConflict?.id]);

  const openCount = conflicts.filter((item) => item.status === "open").length;
  const resolvedCount = conflicts.filter((item) => item.status === "resolved").length;
  const declineCount = conflicts.filter((item) => item.ticketType === "decline").length;
  const reportCount = conflicts.filter((item) => item.ticketType === "report").length;

  const applyResolution = async (action: ResolutionAction) => {
    if (!selectedConflict || selectedConflict.status === "resolved") {
      return;
    }

    await resolveConflictMutation({
      conflictId: selectedConflict.id,
      action,
      notes: resolutionNotes,
    });
  };

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.conflicts}
        title="Conflict Resolution Center"
        subtitle="Review declined vacancies and reported transactions — tenant, landlord, vacancy, payment, and chat in one view"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Open Tickets</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{openCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{resolvedCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Declined Vacancies</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{declineCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Reported Transactions</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">{reportCount}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <section className="card-soft rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold">Dispute Queue</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Type</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as "all" | ConflictTicketType)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="decline">Declined Vacancy</option>
                  <option value="report">Reported Transaction</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as "all" | ConflictStatus)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>

            {isLoading && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
                Loading dispute tickets...
              </div>
            )}

            {!isLoading && (
              <div className="mt-5 space-y-2">
                {filteredConflicts.map((conflict) => (
                  <button
                    key={conflict.id}
                    type="button"
                    onClick={() => setSelectedId(conflict.id)}
                    className={[
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      selectedConflict?.id === conflict.id
                        ? "border-(--brand) bg-(--brand)/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white/90">{conflict.title}</p>
                        <p className="mt-1 text-xs text-white/55">
                          {conflict.id} · {conflict.vacancy.id}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {conflict.tenant.fullName} ↔ {conflict.landlord.fullName}
                        </p>
                      </div>
                      <span className={statusPill(conflict.status)}>{conflict.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={ticketTypePill(conflict.ticketType)}>{conflict.ticketType}</span>
                      <span className={severityPill(conflict.severity)}>{conflict.severity}</span>
                      <span className={vacancyStatusPill(conflict.vacancy.status)}>
                        {conflict.vacancy.status}
                      </span>
                    </div>
                  </button>
                ))}

                {filteredConflicts.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                    No tickets match the selected filters.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4">
            {!selectedConflict && !isLoading && (
              <div className="card-soft rounded-2xl px-4 py-12 text-center text-sm text-white/60">
                Select a dispute ticket to review the full case context.
              </div>
            )}

            {selectedConflict && (
              <>
                <article className="card-soft rounded-2xl p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Ticket</p>
                      <h2 className="mt-1 text-lg font-semibold">{selectedConflict.title}</h2>
                      <p className="mt-1 text-xs text-white/55">
                        {selectedConflict.id} · Reported by {selectedConflict.reportedBy} ·{" "}
                        {formatDate(selectedConflict.detectedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={ticketTypePill(selectedConflict.ticketType)}>
                        {selectedConflict.ticketType}
                      </span>
                      <span className={severityPill(selectedConflict.severity)}>
                        {selectedConflict.severity}
                      </span>
                      <span className={statusPill(selectedConflict.status)}>{selectedConflict.status}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/80">{selectedConflict.reason}</p>

                  {selectedConflict.resolution.action && (
                    <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-emerald-200/80">Resolution</p>
                      <p className="mt-1 text-sm font-medium text-emerald-100">
                        {RESOLUTION_ACTION_LABELS[selectedConflict.resolution.action]}
                      </p>
                      {selectedConflict.resolution.notes && (
                        <p className="mt-1 text-xs text-emerald-100/80">{selectedConflict.resolution.notes}</p>
                      )}
                      {selectedConflict.resolution.resolvedAt && (
                        <p className="mt-1 text-[10px] text-emerald-100/60">
                          Resolved {formatDate(selectedConflict.resolution.resolvedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </article>

                <article className="card-soft rounded-2xl p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">Vacancy Details</h3>
                    <span className={vacancyStatusPill(selectedConflict.vacancy.status)}>
                      {selectedConflict.vacancy.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Property</p>
                      <p className="mt-1 text-sm font-medium text-white/90">{selectedConflict.vacancy.title}</p>
                      <p className="text-xs text-white/60">{selectedConflict.vacancy.address}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Rent & Layout</p>
                      <p className="mt-1 text-sm font-medium text-white/90">
                        {formatCurrency(selectedConflict.vacancy.rentAmount)}/yr
                      </p>
                      <p className="text-xs text-white/60">
                        {selectedConflict.vacancy.bedrooms} bed · {selectedConflict.vacancy.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Commitment Window</p>
                      <p className="mt-1 text-sm text-white/85">
                        {selectedConflict.vacancy.committedAt
                          ? `Locked from ${formatDate(selectedConflict.vacancy.committedAt)}`
                          : "Not committed"}
                      </p>
                      {selectedConflict.vacancy.lockExpiresAt && (
                        <p className="text-xs text-white/55">
                          Expires {formatDate(selectedConflict.vacancy.lockExpiresAt)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Linked Parties</p>
                      <p className="mt-1 text-xs text-white/75">
                        Landlord: {selectedConflict.landlord.fullName}
                      </p>
                      <p className="text-xs text-white/75">Tenant: {selectedConflict.tenant.fullName}</p>
                      {selectedConflict.caretaker && (
                        <p className="text-xs text-white/75">Caretaker: {selectedConflict.caretaker.fullName}</p>
                      )}
                    </div>
                  </div>
                </article>

                <div className="grid gap-4 md:grid-cols-2">
                  <PartyCard
                    label="Tenant"
                    profile={selectedConflict.tenant}
                    ledgerHref={adminLedgerUrl(selectedConflict.tenant.id)}
                  />
                  <PartyCard
                    label="Landlord"
                    profile={selectedConflict.landlord}
                    ledgerHref={adminLedgerUrl(selectedConflict.landlord.id)}
                  />
                </div>

                {selectedConflict.caretaker && (
                  <PartyCard
                    label="Caretaker"
                    profile={selectedConflict.caretaker}
                    ledgerHref={adminLedgerUrl(selectedConflict.caretaker.id)}
                  />
                )}

                <article className="card-soft rounded-2xl p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">Commitment Payment</h3>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        selectedConflict.commitmentPayment.status === "refunded"
                          ? "bg-violet-400/15 text-violet-200"
                          : selectedConflict.commitmentPayment.status === "completed"
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-amber-400/15 text-amber-200",
                      ].join(" ")}
                    >
                      {selectedConflict.commitmentPayment.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Amount</p>
                      <p className="mt-1 text-lg font-semibold text-white/90">
                        {formatCurrency(selectedConflict.commitmentPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Reference</p>
                      <p className="mt-1 text-sm text-white/85">{selectedConflict.commitmentPayment.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Paid At</p>
                      <p className="mt-1 text-sm text-white/85">
                        {formatDate(selectedConflict.commitmentPayment.paidAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Lock Duration</p>
                      <p className="mt-1 text-sm text-white/85">
                        {selectedConflict.commitmentPayment.lockDurationHours} hour(s)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={adminLedgerUrl(
                        selectedConflict.commitmentPayment.userId,
                        selectedConflict.commitmentPayment.ledgerEntryId,
                      )}
                      className="inline-flex rounded-lg border border-(--brand)/40 bg-(--brand)/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-(--brand)/20"
                    >
                      Open in Tenant Ledger ({selectedConflict.commitmentPayment.ledgerEntryId})
                    </Link>
                    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
                      Payment ID: {selectedConflict.commitmentPayment.id}
                    </span>
                  </div>
                </article>

                <article className="card-soft rounded-2xl p-5 md:p-6">
                  <h3 className="text-base font-semibold">Communication Thread</h3>
                  <p className="mt-1 text-xs text-white/55">
                    Messages between tenant, landlord
                    {selectedConflict.caretaker ? ", and caretaker" : ""} for this vacancy
                  </p>
                  <div className="mt-4">
                    <ChatThread messages={selectedConflict.chatThread} />
                  </div>
                </article>

                {selectedConflict.status !== "resolved" && (
                  <article className="card-soft rounded-2xl p-5 md:p-6">
                    <h3 className="text-base font-semibold">Resolution Actions</h3>
                    <p className="mt-1 text-xs text-white/55">
                      Choose an outcome based on vacancy status, payment, and chat context.
                    </p>
                    <label className="mt-4 block text-sm">
                      <span className="text-xs uppercase tracking-wide text-white/60">Admin Notes</span>
                      <textarea
                        value={resolutionNotes}
                        onChange={(event) => setResolutionNotes(event.target.value)}
                        rows={3}
                        placeholder="Document why this resolution was chosen..."
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
                      />
                    </label>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {getSuggestedActions(selectedConflict).map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => applyResolution(action)}
                          disabled={resolving}
                          className={[
                            "rounded-xl border px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                            action === "escalate"
                              ? "border-violet-300/35 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20"
                              : action === "refund_commitment"
                                ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                                : "border-emerald-300/35 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20",
                          ].join(" ")}
                        >
                          {RESOLUTION_ACTION_LABELS[action]}
                        </button>
                      ))}
                    </div>
                  </article>
                )}

                {error && (
                  <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                    {error}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
