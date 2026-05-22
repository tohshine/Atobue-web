export type ConflictTicketType = "decline" | "report";
export type ConflictSeverity = "high" | "medium" | "low";
export type ConflictStatus = "open" | "resolved" | "escalated";
export type VacancyStatus = "pending" | "committed" | "approved" | "agreed" | "declined";
export type ResolutionAction =
  | "refund_commitment"
  | "dismiss_report"
  | "escalate";

export type PartyProfile = {
  id: string;
  fullName: string;
  email: string;
  role: "tenant" | "landlord" | "caretaker";
  status: "active" | "inactive" | "suspended";
  phone: string;
};

export type VacancySummary = {
  id: string;
  title: string;
  address: string;
  rentAmount: number;
  status: VacancyStatus;
  bedrooms: number;
  lockExpiresAt: string | null;
  committedAt: string | null;
  landlordId: string;
  caretakerId: string | null;
};

export type CommitmentPayment = {
  id: string;
  ledgerEntryId: string;
  userId: string;
  amount: number;
  status: "completed" | "pending" | "refunded";
  paidAt: string;
  reference: string;
  lockDurationHours: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "tenant" | "landlord" | "caretaker" | "system";
  content: string;
  sentAt: string;
};

export type ConflictItem = {
  id: string;
  ticketType: ConflictTicketType;
  title: string;
  reason: string;
  reportedBy: "tenant" | "landlord";
  detectedAt: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  vacancy: VacancySummary;
  tenant: PartyProfile;
  landlord: PartyProfile;
  caretaker: PartyProfile | null;
  commitmentPayment: CommitmentPayment;
  chatThread: ChatMessage[];
  resolution: {
    action: ResolutionAction | null;
    notes: string | null;
    resolvedAt: string | null;
    resolvedBy: string | null;
  };
};

type ConflictsResponse = {
  conflicts: ConflictItem[];
  total: number;
  open: number;
  resolved: number;
  escalated: number;
};

export async function getConflicts() {
  const response = await fetch("/api/conflicts", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load conflicts");
  }

  return (await response.json()) as ConflictsResponse;
}

export async function resolveConflict(
  conflictId: string,
  action: ResolutionAction,
  notes?: string,
) {
  const response = await fetch(`/api/conflicts/${conflictId}/resolve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, notes }),
  });

  if (!response.ok) {
    throw new Error("Unable to resolve conflict");
  }

  return (await response.json()) as { conflict: ConflictItem };
}

export const RESOLUTION_ACTION_LABELS: Record<ResolutionAction, string> = {
  refund_commitment: "Send to Refund Center",
  dismiss_report: "Dismiss Report",
  escalate: "Escalate to Senior Review",
};
