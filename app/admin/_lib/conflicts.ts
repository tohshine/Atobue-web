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

type ConflictsResponse = {
  conflicts: ConflictItem[];
  total: number;
  open: number;
  resolved: number;
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

export async function resolveConflict(conflictId: string, source: string) {
  const response = await fetch(`/api/conflicts/${conflictId}/resolve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source }),
  });

  if (!response.ok) {
    throw new Error("Unable to resolve conflict");
  }

  return (await response.json()) as { conflict: ConflictItem };
}
