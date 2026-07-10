"use client";

import { useEffect, useMemo, useState } from "react";
import { adminRoutes } from "@/lib/admin-path";
import { useGetVerificationDetailQuery, useGetVerificationsQuery, useUpdateVerificationMutation } from "@/lib/api";
import type { DocsVerificationStatus, UserVerificationRecord, VerificationAction } from "@/lib/types";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";

type StatusFilter = "all" | DocsVerificationStatus;

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function prettyFileType(fileType: string) {
  return fileType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(status: DocsVerificationStatus) {
  return status.replace("_", " ");
}

function adminActionLabel(action: string | null | undefined) {
  if (!action) {
    return "None";
  }

  return action.replace(/_/g, " ");
}

function canReviewVerification(status: DocsVerificationStatus) {
  return status === "pending";
}

function statusPill(status: DocsVerificationStatus) {
  const base = "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize";
  if (status === "accepted") {
    return `${base} bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20`;
  }
  if (status === "rejected" || status === "denied") {
    return `${base} bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/20`;
  }
  return `${base} bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20`;
}

function StatusIcon({ status }: { status: DocsVerificationStatus }) {
  if (status === "accepted") {
    return (
      <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 6 9 17l-5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "rejected" || status === "denied") {
    return (
      <svg className="h-5 w-5 text-rose-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 6 6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function VerificationAvatar({ record }: { record: UserVerificationRecord }) {
  const { first_name, last_name } = record.user_info;
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--brand)/30 to-violet-400/20 text-sm font-semibold text-violet-100 ring-2 ring-white/10">
      {getInitials(first_name, last_name)}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "amber" | "emerald" | "rose";
}) {
  const toneClasses = {
    default: "text-white",
    amber: "text-amber-200",
    emerald: "text-emerald-200",
    rose: "text-rose-200",
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </article>
  );
}

function VerificationSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="h-[420px] rounded-2xl bg-white/5" />
        <div className="h-[420px] rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

function DocumentViewer({ viewUrl, fileType }: { viewUrl: string; fileType: string }) {
  if (isPdfUrl(viewUrl)) {
    return (
      <iframe
        src={viewUrl}
        title={`${prettyFileType(fileType)} document`}
        className="h-[320px] w-full rounded-b-xl bg-white"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={viewUrl}
      alt={`${prettyFileType(fileType)} document`}
      className="h-[320px] w-full rounded-b-xl bg-black/40 object-contain"
    />
  );
}

function VerificationDetailPanel({ record }: { record: UserVerificationRecord }) {
  const {
    data: detail,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetVerificationDetailQuery(record._id);
  const [updateVerification, { isLoading: isUpdating, reset }] = useUpdateVerificationMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const status = detail?.docs_verification_status ?? record.docs_verification_status;
  const adminAction = detail?.admin_action ?? null;
  const showReviewActions = canReviewVerification(status);

  const applyVerificationAction = async (action: VerificationAction) => {
    reset();
    setActionError(null);

    try {
      await updateVerification({ docsId: record._id, action }).unwrap();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to update verification status. Please try again.";
      setActionError(message);
    }
  };

  return (
    <div className="mt-5 space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-(--brand)/15 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <VerificationAvatar record={record} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold capitalize text-white">{record.user_info.fullname}</p>
            <p className="mt-1 text-sm text-white/55">
              {record.user_info.first_name} {record.user_info.last_name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/75">
                {prettyFileType(detail?.file_type ?? record.file_type)}
              </span>
              <span className={statusPill(status)}>
                {statusLabel(status)}
              </span>
              {isFetching ? (
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-200">
                  Loading…
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Submitted Document</p>
          {detail?.viewUrl ? (
            <a
              href={detail.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
            >
              Open file
            </a>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-white/50">
            Loading document…
          </div>
        ) : isError ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-rose-200">Unable to load document details.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : detail?.viewUrl ? (
          <DocumentViewer viewUrl={detail.viewUrl} fileType={detail.file_type} />
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-white/50">
            No document preview available.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20">
            <StatusIcon status={status} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">Verification Status</p>
            <p className="mt-0.5 text-sm font-medium capitalize text-white/90">{statusLabel(status)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          {status === "accepted"
            ? "This document has been reviewed and accepted. The user identity check is complete."
            : status === "pending" && adminAction === "on_hold"
              ? "This submission is on hold pending further review by the verification team."
              : status === "pending"
                ? "This submission is awaiting review by the verification team."
                : "This document was not approved. The user may need to resubmit corrected documentation."}
        </p>
      </div>

      {showReviewActions ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-white/95">Review Actions</h3>
          <p className="mt-1 text-xs text-white/55">
            Approve the submission or place it on hold for additional review.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => applyVerificationAction("accept")}
              disabled={isUpdating}
              className="rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Processing…" : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => applyVerificationAction("hold")}
              disabled={isUpdating}
              className="rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Processing…" : adminAction === "on_hold" ? "Keep on Hold" : "Place on Hold"}
            </button>
          </div>
          {actionError ? (
            <p className="mt-3 rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : null}

      <dl className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-white/45">Verification ID</dt>
          <dd className="truncate font-mono text-xs text-white/70">{detail?._id ?? record._id}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-white/45">User ID</dt>
          <dd className="truncate font-mono text-xs text-white/70">{detail?.user_id ?? record.user_info._id}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-white/45">Document Type</dt>
          <dd className="text-sm capitalize text-white/85">
            {prettyFileType(detail?.file_type ?? record.file_type)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-white/45">Admin Action</dt>
          <dd className="text-sm capitalize text-white/85">
            {adminActionLabel(adminAction)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function AdminVerificationPage() {
  const { data, isLoading, isError, refetch, isFetching } = useGetVerificationsQuery();
  const verifications = useMemo(() => data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (verifications.length > 0 && !selectedId) {
      setSelectedId(verifications[0]._id);
    }
  }, [verifications, selectedId]);

  const counts = useMemo(() => {
    return verifications.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.docs_verification_status === "accepted") acc.accepted += 1;
        else if (item.docs_verification_status === "pending") acc.pending += 1;
        else acc.rejected += 1;
        return acc;
      },
      { total: 0, accepted: 0, pending: 0, rejected: 0 }
    );
  }, [verifications]);

  const filteredVerifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return verifications.filter((item) => {
      const matchesFilter = filter === "all" || item.docs_verification_status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.user_info.fullname.toLowerCase().includes(normalizedQuery) ||
        item.user_info.first_name.toLowerCase().includes(normalizedQuery) ||
        item.user_info.last_name.toLowerCase().includes(normalizedQuery) ||
        item.file_type.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, verifications]);

  const selected =
    filteredVerifications.find((item) => item._id === selectedId) ??
    verifications.find((item) => item._id === selectedId) ??
    filteredVerifications[0] ??
    null;

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.verification}
        title="Document Verification"
        subtitle="Review identity submissions and verification outcomes"
      >
        {isLoading ? (
          <VerificationSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-8 text-center">
            <p className="text-sm font-medium text-rose-100">Unable to load verification records.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Submissions" value={counts.total} tone="default" />
              <StatCard label="Accepted" value={counts.accepted} tone="emerald" />
              <StatCard label="Pending Review" value={counts.pending} tone="amber" />
              <StatCard label="Rejected / Denied" value={counts.rejected} tone="rose" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <section className="rounded-2xl border border-white/10 bg-white/3 p-5 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white/95">Verification Queue</h2>
                    <p className="mt-1 text-xs text-white/45">
                      {filteredVerifications.length} record(s)
                      {isFetching ? " · syncing…" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search name or document…"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-(--brand) sm:w-52"
                    />
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value as StatusFilter)}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-(--brand)"
                    >
                      <option value="all">All statuses</option>
                      <option value="accepted">Accepted</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {filteredVerifications.map((record) => (
                    <button
                      key={record._id}
                      type="button"
                      onClick={() => setSelectedId(record._id)}
                      className={[
                        "w-full rounded-2xl border p-4 text-left transition",
                        selected?._id === record._id
                          ? "border-(--brand) bg-(--brand)/12 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <VerificationAvatar record={record} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold capitalize text-white/95">
                                {record.user_info.fullname}
                              </p>
                              <p className="mt-1 text-xs text-white/50">{prettyFileType(record.file_type)}</p>
                            </div>
                            <span className={statusPill(record.docs_verification_status)}>
                              {statusLabel(record.docs_verification_status)}
                            </span>
                          </div>
                          <p className="mt-2 font-mono text-[10px] text-white/35">{record._id}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredVerifications.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/55">
                      No verification records match your filters.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/3 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white/95">Record Details</h2>

                {!selected ? (
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/55">
                    Select a verification record to inspect.
                  </div>
                ) : (
                  <VerificationDetailPanel key={selected._id} record={selected} />
                )}
              </section>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
