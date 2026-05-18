"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import { AdminUser, getUsers, updateUserVerification, UserVerificationStatus } from "../_lib/users";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

function verificationPill(status: UserVerificationStatus) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";
  if (status === "approved") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }
  if (status === "denied") {
    return `${common} bg-rose-400/15 text-rose-200`;
  }
  return `${common} bg-amber-400/15 text-amber-200`;
}

function prettyDocumentType(documentType: AdminUser["documentType"]) {
  return documentType.replace("-", " ");
}

export default function AdminVerificationPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [filter, setFilter] = useState<"all" | UserVerificationStatus>("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const payload = await getUsers();
        setUsers(payload.users);
        if (payload.users.length > 0) {
          setSelectedUserId(payload.users[0].id);
        }
        setError(null);
      } catch {
        setError("Failed to load verification queue.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => filter === "all" || user.verificationStatus === filter);
  }, [filter, users]);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;

  const pendingCount = users.filter((user) => user.verificationStatus === "pending").length;
  const approvedCount = users.filter((user) => user.verificationStatus === "approved").length;
  const deniedCount = users.filter((user) => user.verificationStatus === "denied").length;

  const handleUpdate = async (status: UserVerificationStatus) => {
    if (!selectedUser) {
      return;
    }

    try {
      setUpdating(true);
      const payload = await updateUserVerification(selectedUser.id, status);
      setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? payload.user : user)));
      setError(null);
    } catch {
      setError("Unable to update verification status right now.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminGuard>
      <AdminShell
        active="/admin/verification"
        title="Document Verification"
        subtitle="Review uploads, verify identity, and approve or deny requests"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{pendingCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Approved</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{approvedCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Denied</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{deniedCount}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <section className="card-soft rounded-2xl p-5 md:p-6">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold">Verification Queue</h2>
              <label className="text-sm">
                <span className="text-xs uppercase tracking-wide text-white/60">Filter</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as "all" | UserVerificationStatus)}
                  className="ml-2 rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-(--brand)"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </label>
            </div>

            {loading && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
                Loading verification queue...
              </div>
            )}

            {!loading && (
              <div className="mt-5 space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={[
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      selectedUser?.id === user.id
                        ? "border-(--brand) bg-(--brand)/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white/90">{user.fullName}</p>
                        <p className="text-xs text-white/60">
                          {user.id} - {prettyDocumentType(user.documentType)}
                        </p>
                      </div>
                      <span className={verificationPill(user.verificationStatus)}>
                        {user.verificationStatus}
                      </span>
                    </div>
                  </button>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                    No documents found for this filter.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="card-soft rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold">Document Viewer</h2>
            {!selectedUser && !loading && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                Select a user document to review.
              </div>
            )}

            {selectedUser && (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white/90">{selectedUser.fullName}</p>
                  <p className="text-xs text-white/60">
                    {selectedUser.email} - {selectedUser.id}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-white/80">
                      {prettyDocumentType(selectedUser.documentType)}
                    </span>
                    <span className={verificationPill(selectedUser.verificationStatus)}>
                      {selectedUser.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-white/60">
                    <span>Uploaded on {formatDate(selectedUser.documentUploadedAt)}</span>
                    <a
                      href={selectedUser.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10"
                    >
                      Open file
                    </a>
                  </div>
                  <div className="relative h-[260px] w-full">
                    <Image
                      src={selectedUser.documentUrl}
                      alt={`${selectedUser.fullName} document upload`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdate("approved")}
                    disabled={updating}
                    className="rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve Document
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate("denied")}
                    disabled={updating}
                    className="rounded-xl border border-rose-300/35 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Deny Document
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate("pending")}
                  disabled={updating}
                  className="w-full rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Move Back to Pending
                </button>
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
