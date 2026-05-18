"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { ConflictDomain, ConflictItem, ConflictStatus, getConflicts, resolveConflict } from "../_lib/conflicts";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function domainPill(domain: ConflictDomain) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  if (domain === "user") {
    return `${common} bg-cyan-400/15 text-cyan-200`;
  }
  if (domain === "transaction") {
    return `${common} bg-violet-400/15 text-violet-200`;
  }
  return `${common} bg-fuchsia-400/15 text-fuchsia-200`;
}

function severityPill(severity: ConflictItem["severity"]) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  if (severity === "high") {
    return `${common} bg-rose-400/15 text-rose-200`;
  }
  if (severity === "medium") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }
  return `${common} bg-emerald-400/15 text-emerald-200`;
}

function statusPill(status: ConflictStatus) {
  const common = "inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase";
  return status === "resolved"
    ? `${common} bg-emerald-400/15 text-emerald-200`
    : `${common} bg-amber-400/15 text-amber-200`;
}

export default function AdminConflictsPage() {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [domainFilter, setDomainFilter] = useState<"all" | ConflictDomain>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ConflictStatus>("all");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const payload = await getConflicts();
        setConflicts(payload.conflicts);
        if (payload.conflicts.length > 0) {
          setSelectedId(payload.conflicts[0].id);
        }
        setError(null);
      } catch {
        setError("Unable to load conflict center.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredConflicts = useMemo(() => {
    return conflicts.filter((item) => {
      const matchDomain = domainFilter === "all" || item.domain === domainFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchDomain && matchStatus;
    });
  }, [conflicts, domainFilter, statusFilter]);

  const selectedConflict =
    conflicts.find((item) => item.id === selectedId) ?? filteredConflicts[0] ?? null;

  const openCount = conflicts.filter((item) => item.status === "open").length;
  const resolvedCount = conflicts.filter((item) => item.status === "resolved").length;
  const highSeverityCount = conflicts.filter((item) => item.severity === "high").length;

  const chooseSourceOfTruth = async (source: string) => {
    if (!selectedConflict || selectedConflict.status === "resolved") {
      return;
    }

    try {
      setResolving(true);
      const payload = await resolveConflict(selectedConflict.id, source);
      setConflicts((prev) => prev.map((item) => (item.id === selectedConflict.id ? payload.conflict : item)));
      setError(null);
    } catch {
      setError("Failed to resolve conflict.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <AdminGuard>
      <AdminShell
        active="/admin/conflicts"
        title="Conflict Resolve Center"
        subtitle="Users, transactions, and chats source-of-truth detection"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Open Conflicts</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{openCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{resolvedCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">High Severity</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{highSeverityCount}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="card-soft rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Domain</span>
                <select
                  value={domainFilter}
                  onChange={(event) => setDomainFilter(event.target.value as "all" | ConflictDomain)}
                  className="mt-2 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="user">User</option>
                  <option value="transaction">Transaction</option>
                  <option value="chat">Chat</option>
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
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>

            {loading && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
                Loading conflicts...
              </div>
            )}

            {!loading && (
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
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white/90">{conflict.title}</p>
                        <p className="text-xs text-white/60">
                          {conflict.id} - {conflict.entityId}
                        </p>
                      </div>
                      <span className={statusPill(conflict.status)}>{conflict.status}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className={domainPill(conflict.domain)}>{conflict.domain}</span>
                      <span className={severityPill(conflict.severity)}>{conflict.severity}</span>
                    </div>
                  </button>
                ))}

                {filteredConflicts.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                    No conflicts for selected filters.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="card-soft rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold">Source of Truth Decision</h2>
            {!selectedConflict && !loading && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                Select a conflict to inspect details.
              </div>
            )}

            {selectedConflict && (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={domainPill(selectedConflict.domain)}>{selectedConflict.domain}</span>
                    <span className={severityPill(selectedConflict.severity)}>{selectedConflict.severity}</span>
                    <span className={statusPill(selectedConflict.status)}>{selectedConflict.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-white/90">{selectedConflict.reason}</p>
                  <p className="mt-1 text-xs text-white/60">Detected {formatDate(selectedConflict.detectedAt)}</p>
                  <p className="mt-1 text-xs text-white/60">
                    Confidence score: {(selectedConflict.confidenceScore * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Recommended source: <span className="text-cyan-200">{selectedConflict.recommendedSource}</span>
                  </p>
                  {selectedConflict.resolvedSource && selectedConflict.resolvedAt && (
                    <p className="mt-1 text-xs text-emerald-200">
                      Resolved with {selectedConflict.resolvedSource} at {formatDate(selectedConflict.resolvedAt)}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedConflict.sources.map((sourceRecord) => (
                    <article key={sourceRecord.source} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white/90">{sourceRecord.source}</p>
                          <p className="text-xs text-white/60">
                            Updated {formatDate(sourceRecord.lastUpdatedAt)} - reliability{" "}
                            {(sourceRecord.reliability * 100).toFixed(0)}%
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => chooseSourceOfTruth(sourceRecord.source)}
                          disabled={resolving || selectedConflict.status === "resolved"}
                          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Set as Truth
                        </button>
                      </div>

                      <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-white/5 text-white/60">
                            <tr>
                              <th className="px-2 py-1.5">Field</th>
                              <th className="px-2 py-1.5">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(sourceRecord.payload).map(([key, value]) => (
                              <tr key={key} className="border-t border-white/10">
                                <td className="px-2 py-1.5 text-white/70">{key}</td>
                                <td className="px-2 py-1.5 text-white/85">{String(value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  ))}
                </div>

                {selectedConflict.status === "open" && (
                  <button
                    type="button"
                    onClick={() => chooseSourceOfTruth(selectedConflict.recommendedSource)}
                    disabled={resolving}
                    className="w-full rounded-xl bg-(--brand) px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Apply Recommended Source ({selectedConflict.recommendedSource})
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
