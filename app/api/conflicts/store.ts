export type ConflictDomain = "user" | "transaction" | "chat";
export type ConflictSeverity = "high" | "medium" | "low";
export type ConflictStatus = "open" | "resolved";

export type ConflictSourceRecord = {
  source: string;
  lastUpdatedAt: string;
  reliability: number;
  payload: Record<string, string | number | boolean | null>;
};

export type ConflictItem = {
  id: string;
  domain: ConflictDomain;
  entityId: string;
  title: string;
  reason: string;
  detectedAt: string;
  severity: ConflictSeverity;
  confidenceScore: number;
  status: ConflictStatus;
  recommendedSource: string;
  resolvedSource: string | null;
  resolvedAt: string | null;
  sources: ConflictSourceRecord[];
};

const CONFLICTS: ConflictItem[] = [
  {
    id: "CFL-1001",
    domain: "user",
    entityId: "USR-1002",
    title: "User profile mismatch",
    reason: "Phone number differs between auth-service and CRM profile records.",
    detectedAt: "2026-05-18T11:18:00.000Z",
    severity: "high",
    confidenceScore: 0.93,
    status: "open",
    recommendedSource: "auth-service",
    resolvedSource: null,
    resolvedAt: null,
    sources: [
      {
        source: "auth-service",
        lastUpdatedAt: "2026-05-18T10:52:00.000Z",
        reliability: 0.95,
        payload: { fullName: "Kelechi Okafor", phone: "+2348017789001", email: "kelechi.okafor@atobue.com" },
      },
      {
        source: "crm",
        lastUpdatedAt: "2026-05-16T08:34:00.000Z",
        reliability: 0.71,
        payload: { fullName: "Kelechi Okafor", phone: "+2348017780091", email: "kelechi.okafor@atobue.com" },
      },
    ],
  },
  {
    id: "CFL-1002",
    domain: "transaction",
    entityId: "TXN-1002",
    title: "Ledger amount inconsistency",
    reason: "Payment gateway settled amount differs from finance ledger amount.",
    detectedAt: "2026-05-18T10:05:00.000Z",
    severity: "high",
    confidenceScore: 0.88,
    status: "open",
    recommendedSource: "payment-gateway",
    resolvedSource: null,
    resolvedAt: null,
    sources: [
      {
        source: "payment-gateway",
        lastUpdatedAt: "2026-05-18T09:51:00.000Z",
        reliability: 0.92,
        payload: { amount: 27500, currency: "NGN", settlementRef: "PG-331001" },
      },
      {
        source: "finance-ledger",
        lastUpdatedAt: "2026-05-18T09:58:00.000Z",
        reliability: 0.82,
        payload: { amount: 25700, currency: "NGN", settlementRef: "PG-331001" },
      },
    ],
  },
  {
    id: "CFL-1003",
    domain: "chat",
    entityId: "CHT-9014",
    title: "Support chat ownership conflict",
    reason: "Two systems disagree on assigned support agent for the same thread.",
    detectedAt: "2026-05-18T09:01:00.000Z",
    severity: "medium",
    confidenceScore: 0.79,
    status: "open",
    recommendedSource: "support-core",
    resolvedSource: null,
    resolvedAt: null,
    sources: [
      {
        source: "support-core",
        lastUpdatedAt: "2026-05-18T08:58:00.000Z",
        reliability: 0.87,
        payload: { assignedAgent: "Agent Mercy", threadState: "open", priority: "high" },
      },
      {
        source: "chat-sync-worker",
        lastUpdatedAt: "2026-05-18T08:47:00.000Z",
        reliability: 0.68,
        payload: { assignedAgent: "Agent Daniel", threadState: "open", priority: "high" },
      },
    ],
  },
];

export function getConflictsStore() {
  return CONFLICTS;
}

export function resolveConflictInStore(conflictId: string, source: string) {
  const conflict = CONFLICTS.find((item) => item.id === conflictId);
  if (!conflict) {
    return null;
  }

  const sourceExists = conflict.sources.some((entry) => entry.source === source);
  if (!sourceExists) {
    return false;
  }

  conflict.status = "resolved";
  conflict.resolvedSource = source;
  conflict.resolvedAt = new Date().toISOString();
  return conflict;
}
