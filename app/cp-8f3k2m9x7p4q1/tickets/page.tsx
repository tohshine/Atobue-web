"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminLedgerUrl, adminRoutes } from "@/lib/admin-path";
import { useGetTicketDetailQuery, useGetTicketRoomMessagesQuery, useGetTicketsQuery } from "@/lib/api";
import type { TicketDetail, TicketListItem, TicketParty, TicketRoomThread } from "@/lib/types";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import PaginationBar from "../_components/PaginationBar";
import { formatCurrency } from "../_lib/data";

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function humanize(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(amount: number | null | undefined, currency = "NGN") {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "Not available";
  }

  if (currency === "NGN") {
    return formatCurrency(amount);
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusPill(status: string | null | undefined) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium";
  const normalized = status?.toLowerCase();

  if (normalized === "resolved" || normalized === "closed") {
    return `${common} bg-emerald-400/15 text-emerald-200`;
  }

  if (normalized === "open") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }

  if (normalized === "escalated") {
    return `${common} bg-violet-400/15 text-violet-200`;
  }

  return `${common} bg-cyan-400/15 text-cyan-200`;
}

function getPriorityPill(priority: string | null | undefined) {
  const common = "inline-flex rounded-full px-2.5 py-1 text-xs font-medium";
  const normalized = priority?.toLowerCase();

  if (normalized === "urgent") {
    return `${common} bg-fuchsia-400/15 text-fuchsia-200`;
  }

  if (normalized === "high") {
    return `${common} bg-rose-400/15 text-rose-200`;
  }

  if (normalized === "medium") {
    return `${common} bg-amber-400/15 text-amber-200`;
  }

  return `${common} bg-emerald-400/15 text-emerald-200`;
}

function getTypePill(type: string | null | undefined) {
  const normalized = type?.toLowerCase();

  if (normalized?.includes("decline")) {
    return "inline-flex rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-medium text-rose-100";
  }

  if (normalized?.includes("payment") || normalized?.includes("refund")) {
    return "inline-flex rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-medium text-cyan-100";
  }

  return "inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/75";
}

function getParticipantPillClasses(kind: "reporter" | "against" | "caretaker" | "participant") {
  if (kind === "reporter") {
    return "inline-flex rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-medium uppercase text-cyan-200";
  }

  if (kind === "against") {
    return "inline-flex rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] font-medium uppercase text-violet-200";
  }

  if (kind === "caretaker") {
    return "inline-flex rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-200";
  }

  return "inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase text-white/60";
}

function resolveParticipantMeta(ticket: TicketDetail, senderId: string) {
  if (ticket.reporter?._id === senderId) {
    return {
      name: ticket.reporter.fullname,
      label: "Reporter",
      kind: "reporter" as const,
    };
  }

  if (ticket.against?._id === senderId) {
    return {
      name: ticket.against.fullname,
      label: "Against",
      kind: "against" as const,
    };
  }

  if (ticket.caretaker?._id === senderId) {
    return {
      name: ticket.caretaker.fullname,
      label: "Caretaker",
      kind: "caretaker" as const,
    };
  }

  return {
    name: senderId,
    label: "Participant",
    kind: "participant" as const,
  };
}

function InfoGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: React.ReactNode;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">{item.label}</p>
          <div className="mt-1 wrap-break-word text-sm text-white/85">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "amber" | "rose" | "emerald";
}) {
  const toneClasses = {
    cyan: "text-cyan-200",
    amber: "text-amber-200",
    rose: "text-rose-200",
    emerald: "text-emerald-200",
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/6 blur-3xl" />
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
    </article>
  );
}

function QueueCard({
  ticket,
  selected,
  onSelect,
}: {
  ticket: TicketListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition",
        selected
          ? "border-(--brand) bg-(--brand)/12 shadow-[0_0_0_1px_rgba(45,179,255,0.18)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/70">
              {ticket.ticket_number}
            </span>
            <span className={getStatusPill(ticket.status)}>{humanize(ticket.status)}</span>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white/95">{ticket.title}</h3>
          <p className="mt-1 text-xs text-white/55">{humanize(ticket.type)}</p>
        </div>
        <span className={getPriorityPill(ticket.priority)}>{humanize(ticket.priority)}</span>
      </div>

      <div className="mt-4 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-wide text-white/40">Parties</p>
        <p className="mt-1 text-sm text-white/85">{ticket.users.for}</p>
        <p className="text-sm text-white/55">Against {ticket.users.against}</p>
      </div>

      <div className="mt-3 flex flex-col items-start gap-2 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span className="break-all">{ticket._id}</span>
        <span>{formatDateTime(ticket.createdAt)}</span>
      </div>
    </button>
  );
}

function PersonCard({
  label,
  person,
  ledgerUserId,
}: {
  label: string;
  person: TicketParty | null;
  ledgerUserId?: string | null;
}) {
  if (!person) {
    return (
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
        <p className="mt-3 text-sm text-white/60">No linked profile for this role.</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
          <h3 className="mt-2 text-base font-semibold text-white/95">{person.fullname}</h3>
          <p className="break-all text-sm text-white/60">{person.email}</p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
          {person.status || "Unknown"}
        </span>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/80">
        <p>{person.tel || "No phone number"}</p>
        <p className="break-all text-xs text-white/45">{person._id}</p>
      </div>

      {ledgerUserId ? (
        <Link
          href={adminLedgerUrl(ledgerUserId)}
          className="mt-4 inline-flex rounded-xl border border-(--brand)/30 bg-(--brand)/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-(--brand)/20"
        >
          Open ledger
        </Link>
      ) : null}
    </article>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 rounded-3xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-44 rounded-2xl bg-white/5" />
        <div className="h-44 rounded-2xl bg-white/5" />
        <div className="h-44 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function TicketConversationPanel({
  ticket,
  rooms,
  isLoading,
  isError,
  isRefreshing,
  onRetry,
}: {
  ticket: TicketDetail;
  rooms: TicketRoomThread[];
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  onRetry: () => void;
}) {
  const participantCount = new Set(rooms.flatMap((room) => room.participants)).size;
  const messages = rooms
    .flatMap((room) => room.messages)
    .sort((left, right) => {
      return new Date(left.sending_time).getTime() - new Date(right.sending_time).getTime();
    });

  if (!ticket.room_id) {
    return (
      <article className="card-soft rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Room Conversation</h3>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/60">No room linked</span>
        </div>
        <p className="mt-4 text-sm text-white/60">
          This ticket does not include a room id, so no user conversation can be loaded.
        </p>
      </article>
    );
  }

  return (
    <article className="card-soft rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Room Conversation</h3>
          <p className="mt-1 text-xs text-white/55">
            Messages loaded from <code>/admin/tickets/rooms/:roomId/messages</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/65">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/65">
            {participantCount} participant{participantCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/65">
            {isRefreshing ? "Refreshing..." : "Live"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-white/45">Room Id</p>
        <p className="mt-1 break-all font-mono text-xs text-white/65">{ticket.room_id}</p>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5 text-sm text-rose-100">
          <p>Unable to load room conversation.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
          >
            Retry chat request
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
          No messages were returned for this room.
        </div>
      ) : (
        <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
          {messages.map((message) => {
            const participant = resolveParticipantMeta(ticket, message.senderId);
            const alignsRight = participant.kind === "against";

            return (
              <div
                key={message._id}
                className={`flex ${alignsRight ? "justify-end" : "justify-start"}`}
              >
                <article className="max-w-[88%] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white/90">{participant.name}</p>
                    <span className={getParticipantPillClasses(participant.kind)}>{participant.label}</span>
                    <span className="text-[10px] text-white/45">{formatDateTime(message.sending_time)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-white/80">
                    {message.text || "No text content"}
                  </p>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function TicketDetailPanel({
  ticket,
  isRefreshing,
  roomThreads,
  isRoomMessagesLoading,
  isRoomMessagesError,
  isRoomMessagesRefreshing,
  onRetryRoomMessages,
}: {
  ticket: TicketDetail;
  isRefreshing: boolean;
  roomThreads: TicketRoomThread[];
  isRoomMessagesLoading: boolean;
  isRoomMessagesError: boolean;
  isRoomMessagesRefreshing: boolean;
  onRetryRoomMessages: () => void;
}) {
  const paymentCurrency = ticket.payment?.currency ?? "NGN";

  return (
    <div className="space-y-4">
      <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-(--brand)/15 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75">
                  {ticket.ticket_number}
                </span>
                <span className={getStatusPill(ticket.status)}>{humanize(ticket.status)}</span>
                <span className={getPriorityPill(ticket.priority)}>{humanize(ticket.priority)}</span>
                <span className={getTypePill(ticket.type)}>{humanize(ticket.type)}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{ticket.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{ticket.description}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-wide text-white/45">Created</p>
              <p className="mt-1 text-sm text-white/90">{formatDateTime(ticket.createdAt)}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-white/45">Refresh State</p>
              <p className="mt-1 text-sm text-white/70">{isRefreshing ? "Refreshing..." : "Live"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-white/45">Ticket Id</p>
            <p className="mt-1 break-all font-mono text-xs text-white/55">{ticket._id}</p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <article className="card-soft rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Case Overview</h3>
              <span className="max-w-full break-all rounded-2xl bg-white/10 px-2.5 py-1 text-xs text-white/70">
                {ticket.room_id || "No room linked"}
              </span>
            </div>
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Reporter", value: ticket.reporter?.fullname ?? "Not available" },
                  { label: "Against", value: ticket.against?.fullname ?? "Not available" },
                  { label: "Caretaker", value: ticket.caretaker?.fullname ?? "Not linked" },
                  { label: "Admin Notes", value: ticket.admin_notes ?? "No admin note yet" },
                ]}
              />
            </div>
          </article>

          <article className="card-soft rounded-2xl p-5 md:p-6">
            <h3 className="text-base font-semibold">Property & Vacancy</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/45">Property</p>
                <h4 className="mt-2 text-sm font-semibold text-white/90">
                  {ticket.property?.title || ticket.property?.name || "Not available"}
                </h4>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {ticket.property?.location ?? "No property location attached to this ticket."}
                </p>
                {ticket.property?._id ? (
                  <p className="mt-3 font-mono text-[11px] text-white/45">{ticket.property._id}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/45">Vacancy</p>
                    <h4 className="mt-2 text-sm font-semibold text-white/90">
                      {ticket.vacancy?.title ?? "Not available"}
                    </h4>
                  </div>
                  {ticket.vacancy?.status ? (
                    <span className={getStatusPill(ticket.vacancy.status)}>
                      {humanize(ticket.vacancy.status)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <InfoGrid
                    items={[
                      {
                        label: "Rent",
                        value: ticket.vacancy
                          ? `${formatMoney(ticket.vacancy.rent, paymentCurrency)} / ${ticket.vacancy.rent_duration}`
                          : "Not available",
                      },
                      { label: "Listing Type", value: humanize(ticket.vacancy?.listing_type) },
                      { label: "Unit Number", value: ticket.vacancy?.unit_number ?? "Not available" },
                      { label: "Vacancy Id", value: ticket.vacancy?._id ?? "Not available" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="card-soft rounded-2xl p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">Enquiry Trail</h3>
                {ticket.enquiry?.status ? (
                  <span className={getStatusPill(ticket.enquiry.status)}>
                    {humanize(ticket.enquiry.status)}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <InfoGrid
                  items={[
                    {
                      label: "Commitment Paid",
                      value: ticket.enquiry?.commitment_paid ? "Yes" : "No",
                    },
                    {
                      label: "Decline Reason",
                      value: ticket.enquiry?.decline_reason
                        ? humanize(ticket.enquiry.decline_reason)
                        : "Not available",
                    },
                    {
                      label: "Commitment Paid At",
                      value: formatDateTime(ticket.enquiry?.commitment_paid_at),
                    },
                    { label: "Expires", value: formatDateTime(ticket.enquiry?.expires) },
                  ]}
                />
              </div>
            </article>

            <article className="card-soft rounded-2xl p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">Payment Trail</h3>
                {ticket.payment?.status ? (
                  <span className={getStatusPill(ticket.payment.status)}>
                    {humanize(ticket.payment.status)}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <InfoGrid
                  items={[
                    {
                      label: "Amount Paid",
                      value: ticket.payment
                        ? formatMoney(ticket.payment.amount_paid, ticket.payment.currency)
                        : "Not available",
                    },
                    { label: "Reference", value: ticket.payment?.reference ?? "Not available" },
                    { label: "Payment Type", value: humanize(ticket.payment?.type) },
                    { label: "Success Time", value: formatDateTime(ticket.payment?.success_time) },
                  ]}
                />
              </div>
            </article>

            <TicketConversationPanel
              ticket={ticket}
              rooms={roomThreads}
              isLoading={isRoomMessagesLoading}
              isError={isRoomMessagesError}
              isRefreshing={isRoomMessagesRefreshing}
              onRetry={onRetryRoomMessages}
            />
          </div>
        </div>

        <div className="space-y-4">
          <PersonCard
            label="Reporter"
            person={ticket.reporter}
            ledgerUserId={ticket.reporter?._id}
          />
          <PersonCard
            label="Against"
            person={ticket.against}
            ledgerUserId={ticket.against?._id}
          />
          <PersonCard
            label="Caretaker"
            person={ticket.caretaker}
            ledgerUserId={ticket.caretaker?._id}
          />

          <article className="card-soft rounded-2xl p-5">
            <h3 className="text-base font-semibold">Linked References</h3>
            <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">Reporter Id</p>
                <p className="mt-1 break-all font-mono text-xs text-white/65">
                  {ticket.reporter?._id ?? "Not available"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">Against Id</p>
                <p className="mt-1 break-all font-mono text-xs text-white/65">
                  {ticket.against?._id ?? "Not available"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">Caretaker Id</p>
                <p className="mt-1 break-all font-mono text-xs text-white/65">
                  {ticket.caretaker?._id ?? "Not available"}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    isError: isListError,
    refetch: refetchList,
    isFetching: isRefreshingList,
  } = useGetTicketsQuery({ p: page });
  const tickets = data?.items ?? [];

  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTickets = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !searchText ||
        ticket.title.toLowerCase().includes(searchText) ||
        ticket.ticket_number.toLowerCase().includes(searchText) ||
        ticket._id.toLowerCase().includes(searchText) ||
        ticket.users.for.toLowerCase().includes(searchText) ||
        ticket.users.against.toLowerCase().includes(searchText) ||
        ticket.type.toLowerCase().includes(searchText);

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, query, statusFilter, tickets]);

  const selectedId = useMemo(() => {
    if (filteredTickets.length === 0) {
      return "";
    }

    const hasManualSelection = manualSelectedId
      ? filteredTickets.some((ticket) => ticket._id === manualSelectedId)
      : false;

    return hasManualSelection ? manualSelectedId! : filteredTickets[0]._id;
  }, [filteredTickets, manualSelectedId]);

  const {
    data: selectedTicket,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
    isFetching: isRefreshingDetail,
  } = useGetTicketDetailQuery(selectedId, {
    skip: !selectedId,
  });

  const selectedRoomId = selectedTicket?.room_id ?? "";
  const {
    data: roomThreads = [],
    isLoading: isRoomMessagesLoading,
    isError: isRoomMessagesError,
    refetch: refetchRoomMessages,
    isFetching: isRefreshingRoomMessages,
  } = useGetTicketRoomMessagesQuery(selectedRoomId, {
    skip: !selectedRoomId,
  });

  const totalTickets = data?.total ?? tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status.toLowerCase() === "open").length;
  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority.toLowerCase() === "high" || ticket.priority.toLowerCase() === "urgent",
  ).length;
  const uniqueTicketTypes = new Set(tickets.map((ticket) => ticket.type)).size;

  const statusOptions = useMemo(() => {
    return Array.from(new Set(tickets.map((ticket) => ticket.status))).sort();
  }, [tickets]);

  const priorityOptions = useMemo(() => {
    return Array.from(new Set(tickets.map((ticket) => ticket.priority))).sort();
  }, [tickets]);

  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.tickets}
        title="Support Ticket Desk"
        subtitle="Monitor active cases, inspect full ticket context, and review linked property and payment records"
      >
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6 md:p-7">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-(--brand)/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Admin Tickets</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  A cleaner queue for customer support escalations
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  The left rail pulls from <code>/admin/tickets</code>, while the active case panel hydrates
                  from <code>/admin/tickets/:ticketId</code> so admins can move from triage into full case
                  context without leaving the page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  refetchList();
                  if (selectedId) {
                    refetchDetail();
                  }
                  if (selectedRoomId) {
                    refetchRoomMessages();
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-(--brand)/35 bg-(--brand)/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-(--brand)/20"
              >
                {isRefreshingList || isRefreshingDetail || isRefreshingRoomMessages
                  ? "Refreshing..."
                  : "Refresh tickets"}
              </button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Tickets" value={totalTickets} tone="cyan" />
            <MetricCard label="Open Cases" value={openTickets} tone="amber" />
            <MetricCard label="High Priority" value={highPriorityTickets} tone="rose" />
            <MetricCard label="Ticket Types" value={uniqueTicketTypes} tone="emerald" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <section className="card-soft rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Ticket Queue</h3>
                  <p className="mt-1 text-sm text-white/55">
                    Search by title, people, ticket number, id, or issue type.
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">
                  {filteredTickets.length} visible
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-white/45">Search</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search ticket, reporter, or opponent..."
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-(--brand)"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs uppercase tracking-wide text-white/45">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
                    >
                      <option value="all">All</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {humanize(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs uppercase tracking-wide text-white/45">Priority</span>
                    <select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-(--brand)"
                    >
                      <option value="all">All</option>
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {humanize(priority)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-5 space-y-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-40 rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : isListError ? (
                <div className="mt-5 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5 text-sm text-rose-100">
                  <p>Unable to load the support ticket queue.</p>
                  <button
                    type="button"
                    onClick={() => refetchList()}
                    className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
                  >
                    Retry request
                  </button>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
                  No tickets match the current search or filters.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {filteredTickets.map((ticket) => (
                    <QueueCard
                      key={ticket._id}
                      ticket={ticket}
                      selected={ticket._id === selectedId}
                      onSelect={() => setManualSelectedId(ticket._id)}
                    />
                  ))}
                </div>
              )}

              {!isLoading && !isListError && (
                <PaginationBar
                  page={data?.page ?? page}
                  pageCount={data?.pageCount ?? null}
                  hasMore={data?.hasMore ?? false}
                  total={data?.total ?? null}
                  itemCount={filteredTickets.length}
                  onPageChange={(nextPage) => {
                    setManualSelectedId(null);
                    setPage(nextPage);
                  }}
                  disabled={isRefreshingList}
                />
              )}
            </section>

            <section>
              {!selectedId && !isLoading ? (
                <div className="card-soft rounded-2xl px-4 py-16 text-center text-sm text-white/60">
                  Select a ticket to inspect the full case details.
                </div>
              ) : isDetailLoading ? (
                <TicketDetailSkeleton />
              ) : isDetailError || !selectedTicket ? (
                <div className="card-soft rounded-2xl p-6">
                  <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5 text-sm text-rose-100">
                    <p>Unable to load this ticket detail record.</p>
                    <button
                      type="button"
                      onClick={() => refetchDetail()}
                      className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
                    >
                      Retry detail request
                    </button>
                  </div>
                </div>
              ) : (
                <TicketDetailPanel
                  ticket={selectedTicket}
                  isRefreshing={isRefreshingDetail || isRefreshingRoomMessages}
                  roomThreads={roomThreads}
                  isRoomMessagesLoading={isRoomMessagesLoading}
                  isRoomMessagesError={isRoomMessagesError}
                  isRoomMessagesRefreshing={isRefreshingRoomMessages}
                  onRetryRoomMessages={() => refetchRoomMessages()}
                />
              )}
            </section>
          </div>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
