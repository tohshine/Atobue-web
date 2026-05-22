import type {
  ChatMessage,
  CommitmentPayment,
  ConflictItem,
  ConflictSeverity,
  ConflictStatus,
  ConflictTicketType,
  PartyProfile,
  ResolutionAction,
  VacancyStatus,
  VacancySummary,
} from "@/app/cp-8f3k2m9x7p4q1/_lib/conflicts";

export type {
  ChatMessage,
  CommitmentPayment,
  ConflictItem,
  ConflictSeverity,
  ConflictStatus,
  ConflictTicketType,
  PartyProfile,
  ResolutionAction,
  VacancyStatus,
  VacancySummary,
};

const TENANT_MARY: PartyProfile = {
  id: "USR-1001",
  fullName: "Mary Johnson",
  email: "mary.johnson@atobue.com",
  role: "tenant",
  status: "active",
  phone: "+2348012345678",
};

const LANDLORD_KELECHI: PartyProfile = {
  id: "USR-1002",
  fullName: "Kelechi Okafor",
  email: "kelechi.okafor@atobue.com",
  role: "landlord",
  status: "active",
  phone: "+2348017789001",
};

const TENANT_DAVID: PartyProfile = {
  id: "USR-1004",
  fullName: "David Mensah",
  email: "david.mensah@atobue.com",
  role: "tenant",
  status: "active",
  phone: "+2348098765432",
};

const LANDLORD_ADAEZE: PartyProfile = {
  id: "USR-1005",
  fullName: "Adaeze Nnaji",
  email: "adaeze.nnaji@atobue.com",
  role: "landlord",
  status: "inactive",
  phone: "+2348076543210",
};

const CARETAKER_FATIMA: PartyProfile = {
  id: "USR-1003",
  fullName: "Fatima Ibrahim",
  email: "fatima.ibrahim@atobue.com",
  role: "caretaker",
  status: "suspended",
  phone: "+2348034567890",
};

const CONFLICTS: ConflictItem[] = [
  {
    id: "TKT-2001",
    ticketType: "decline",
    title: "Landlord declined vacancy after commitment",
    reason:
      "Landlord declined Mary Johnson for 2BR Lekki Apartment after commitment fee was paid. Background check flagged inconsistent employment records.",
    reportedBy: "tenant",
    detectedAt: "2026-05-20T14:22:00.000Z",
    severity: "high",
    status: "open",
    vacancy: {
      id: "VAC-3012",
      title: "2BR Lekki Phase 1 Apartment",
      address: "12 Admiralty Way, Lekki Phase 1, Lagos",
      rentAmount: 850000,
      status: "declined",
      bedrooms: 2,
      lockExpiresAt: "2026-05-20T15:22:00.000Z",
      committedAt: "2026-05-20T14:22:00.000Z",
      landlordId: "USR-1002",
      caretakerId: "USR-1003",
    },
    tenant: TENANT_MARY,
    landlord: LANDLORD_KELECHI,
    caretaker: CARETAKER_FATIMA,
    commitmentPayment: {
      id: "CMF-5501",
      ledgerEntryId: "TXN-1006",
      userId: "USR-1001",
      amount: 15000,
      status: "completed",
      paidAt: "2026-05-20T14:22:00.000Z",
      reference: "CMF-VAC-3012",
      lockDurationHours: 1,
    },
    chatThread: [
      {
        id: "MSG-1",
        senderId: "USR-1001",
        senderName: "Mary Johnson",
        senderRole: "tenant",
        content: "Hi, I just paid the commitment fee for the 2BR apartment. Is the viewing still on for today?",
        sentAt: "2026-05-20T14:23:00.000Z",
      },
      {
        id: "MSG-2",
        senderId: "USR-1002",
        senderName: "Kelechi Okafor",
        senderRole: "landlord",
        content: "Received. Running a quick background check before I confirm. I'll get back within the hour.",
        sentAt: "2026-05-20T14:28:00.000Z",
      },
      {
        id: "MSG-3",
        senderId: "USR-1003",
        senderName: "Fatima Ibrahim",
        senderRole: "caretaker",
        content: "Keys are ready at the front desk if approved. Vacancy is locked to Mary until 3:22 PM.",
        sentAt: "2026-05-20T14:35:00.000Z",
      },
      {
        id: "MSG-4",
        senderId: "USR-1002",
        senderName: "Kelechi Okafor",
        senderRole: "landlord",
        content:
          "I've reviewed the documents and unfortunately I have to decline this application. Employment verification did not match the submitted records.",
        sentAt: "2026-05-20T15:05:00.000Z",
      },
      {
        id: "MSG-5",
        senderId: "USR-1001",
        senderName: "Mary Johnson",
        senderRole: "tenant",
        content: "That's unfair — my documents are valid. I want my commitment fee refunded immediately.",
        sentAt: "2026-05-20T15:08:00.000Z",
      },
      {
        id: "MSG-6",
        senderId: "system",
        senderName: "Atobue System",
        senderRole: "system",
        content: "Dispute ticket TKT-2001 opened. An admin will review this case.",
        sentAt: "2026-05-20T15:10:00.000Z",
      },
    ],
    resolution: {
      action: null,
      notes: null,
      resolvedAt: null,
      resolvedBy: null,
    },
  },
  {
    id: "TKT-2002",
    ticketType: "report",
    title: "Tenant reported commitment fee not reflected",
    reason:
      "David Mensah reported that his commitment payment for Victoria Island Studio was debited but the vacancy lock was not applied. Payment reference CMF-VAC-3018 shows completed on gateway but vacancy status stayed pending.",
    reportedBy: "tenant",
    detectedAt: "2026-05-19T11:45:00.000Z",
    severity: "high",
    status: "open",
    vacancy: {
      id: "VAC-3018",
      title: "Studio Flat — Victoria Island",
      address: "8A Adeola Odeku Street, Victoria Island, Lagos",
      rentAmount: 620000,
      status: "pending",
      bedrooms: 1,
      lockExpiresAt: null,
      committedAt: null,
      landlordId: "USR-1005",
      caretakerId: null,
    },
    tenant: TENANT_DAVID,
    landlord: LANDLORD_ADAEZE,
    caretaker: null,
    commitmentPayment: {
      id: "CMF-5502",
      ledgerEntryId: "TXN-1007",
      userId: "USR-1004",
      amount: 12000,
      status: "completed",
      paidAt: "2026-05-19T11:40:00.000Z",
      reference: "CMF-VAC-3018",
      lockDurationHours: 1,
    },
    chatThread: [
      {
        id: "MSG-7",
        senderId: "USR-1004",
        senderName: "David Mensah",
        senderRole: "tenant",
        content: "I paid the commitment fee 5 minutes ago but the vacancy still shows as available. Can you confirm?",
        sentAt: "2026-05-19T11:42:00.000Z",
      },
      {
        id: "MSG-8",
        senderId: "USR-1005",
        senderName: "Adaeze Nnaji",
        senderRole: "landlord",
        content: "I don't see any lock on my end. The unit is still open on the dashboard.",
        sentAt: "2026-05-19T11:44:00.000Z",
      },
      {
        id: "MSG-9",
        senderId: "USR-1004",
        senderName: "David Mensah",
        senderRole: "tenant",
        content: "My bank shows ₦12,000 debited with ref CMF-VAC-3018. I'm reporting this transaction.",
        sentAt: "2026-05-19T11:45:00.000Z",
      },
      {
        id: "MSG-10",
        senderId: "system",
        senderName: "Atobue System",
        senderRole: "system",
        content: "Report ticket TKT-2002 opened. Payment and vacancy sync under review.",
        sentAt: "2026-05-19T11:46:00.000Z",
      },
    ],
    resolution: {
      action: null,
      notes: null,
      resolvedAt: null,
      resolvedBy: null,
    },
  },
  {
    id: "TKT-2003",
    ticketType: "decline",
    title: "Tenant dispute after landlord background check delay",
    reason:
      "Kelechi Okafor declined David Mensah for Yaba 1BR after the 1-hour lock expired without tenant response to document request. Tenant claims landlord exceeded review window.",
    reportedBy: "tenant",
    detectedAt: "2026-05-17T16:30:00.000Z",
    severity: "medium",
    status: "resolved",
    vacancy: {
      id: "VAC-3025",
      title: "1BR Yaba Close to UNILAG",
      address: "45 Herbert Macaulay Way, Yaba, Lagos",
      rentAmount: 480000,
      status: "declined",
      bedrooms: 1,
      lockExpiresAt: "2026-05-17T15:30:00.000Z",
      committedAt: "2026-05-17T14:30:00.000Z",
      landlordId: "USR-1002",
      caretakerId: null,
    },
    tenant: TENANT_DAVID,
    landlord: LANDLORD_KELECHI,
    caretaker: null,
    commitmentPayment: {
      id: "CMF-5503",
      ledgerEntryId: "TXN-1008",
      userId: "USR-1004",
      amount: 10000,
      status: "refunded",
      paidAt: "2026-05-17T14:30:00.000Z",
      reference: "CMF-VAC-3025",
      lockDurationHours: 1,
    },
    chatThread: [
      {
        id: "MSG-11",
        senderId: "USR-1004",
        senderName: "David Mensah",
        senderRole: "tenant",
        content: "Commitment paid. Ready to share my employment letter.",
        sentAt: "2026-05-17T14:31:00.000Z",
      },
      {
        id: "MSG-12",
        senderId: "USR-1002",
        senderName: "Kelechi Okafor",
        senderRole: "landlord",
        content: "Please upload your last 3 months bank statements for review.",
        sentAt: "2026-05-17T14:45:00.000Z",
      },
      {
        id: "MSG-13",
        senderId: "USR-1004",
        senderName: "David Mensah",
        senderRole: "tenant",
        content: "The lock expired before I could respond. I still want the apartment.",
        sentAt: "2026-05-17T16:00:00.000Z",
      },
      {
        id: "MSG-14",
        senderId: "USR-1002",
        senderName: "Kelechi Okafor",
        senderRole: "landlord",
        content: "Lock window closed. Application declined due to incomplete verification.",
        sentAt: "2026-05-17T16:15:00.000Z",
      },
    ],
    resolution: {
      action: "refund_commitment",
      notes: "Commitment fee refunded — lock expired before tenant could submit requested documents.",
      resolvedAt: "2026-05-18T09:00:00.000Z",
      resolvedBy: "Admin",
    },
  },
  {
    id: "TKT-2004",
    ticketType: "report",
    title: "Landlord reported fraudulent commitment attempt",
    reason:
      "Adaeze Nnaji reported a suspicious commitment payment from an unverified account for her VI Studio. Tenant profile shows suspended status on a linked duplicate email.",
    reportedBy: "landlord",
    detectedAt: "2026-05-16T08:12:00.000Z",
    severity: "medium",
    status: "escalated",
    vacancy: {
      id: "VAC-3018",
      title: "Studio Flat — Victoria Island",
      address: "8A Adeola Odeku Street, Victoria Island, Lagos",
      rentAmount: 620000,
      status: "committed",
      bedrooms: 1,
      lockExpiresAt: "2026-05-16T09:12:00.000Z",
      committedAt: "2026-05-16T08:12:00.000Z",
      landlordId: "USR-1005",
      caretakerId: null,
    },
    tenant: TENANT_MARY,
    landlord: LANDLORD_ADAEZE,
    caretaker: null,
    commitmentPayment: {
      id: "CMF-5504",
      ledgerEntryId: "TXN-1009",
      userId: "USR-1001",
      amount: 12000,
      status: "completed",
      paidAt: "2026-05-16T08:12:00.000Z",
      reference: "CMF-VAC-3018-B",
      lockDurationHours: 1,
    },
    chatThread: [
      {
        id: "MSG-15",
        senderId: "USR-1005",
        senderName: "Adaeze Nnaji",
        senderRole: "landlord",
        content: "Someone committed to my studio but the profile looks suspicious. Email doesn't match the ID on file.",
        sentAt: "2026-05-16T08:15:00.000Z",
      },
      {
        id: "MSG-16",
        senderId: "USR-1001",
        senderName: "Mary Johnson",
        senderRole: "tenant",
        content: "That wasn't me — I never applied for this unit.",
        sentAt: "2026-05-16T08:20:00.000Z",
      },
      {
        id: "MSG-17",
        senderId: "system",
        senderName: "Atobue System",
        senderRole: "system",
        content: "Report ticket TKT-2004 escalated for identity verification review.",
        sentAt: "2026-05-16T08:25:00.000Z",
      },
    ],
    resolution: {
      action: "escalate",
      notes: "Escalated to fraud team — possible duplicate account using tenant credentials.",
      resolvedAt: null,
      resolvedBy: "Admin",
    },
  },
];

export function getConflictsStore() {
  return CONFLICTS;
}

export function getConflictById(conflictId: string) {
  return CONFLICTS.find((item) => item.id === conflictId) ?? null;
}

export function resolveConflictInStore(
  conflictId: string,
  action: ResolutionAction,
  notes?: string,
) {
  const conflict = CONFLICTS.find((item) => item.id === conflictId);
  if (!conflict) {
    return null;
  }

  if (conflict.status === "resolved") {
    return false;
  }

  if (action === "escalate") {
    conflict.status = "escalated";
    conflict.resolution = {
      action,
      notes: notes?.trim() || "Escalated for senior review.",
      resolvedAt: null,
      resolvedBy: "Admin",
    };
    return conflict;
  }

  conflict.status = "resolved";
  conflict.resolution = {
    action,
    notes: notes?.trim() || null,
    resolvedAt: new Date().toISOString(),
    resolvedBy: "Admin",
  };

  if (action === "refund_commitment") {
    conflict.commitmentPayment.status = "refunded";
  }

  if (action === "dismiss_report" && conflict.vacancy.status === "pending") {
    conflict.vacancy.status = "committed";
    conflict.vacancy.committedAt = conflict.commitmentPayment.paidAt;
    conflict.vacancy.lockExpiresAt = new Date(
      new Date(conflict.commitmentPayment.paidAt).getTime() +
        conflict.commitmentPayment.lockDurationHours * 60 * 60 * 1000,
    ).toISOString();
  }

  return conflict;
}
