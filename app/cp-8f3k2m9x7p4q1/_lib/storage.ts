import { INITIAL_LEDGER_ENTRIES, INITIAL_REFUNDS, LedgerEntry, RefundRequest } from "./data";

export { clearAuthSession as clearAdminSession, isAuthenticated as isAdminAuthenticated } from "@/lib/auth/session";

const LEDGER_KEY = "atobue-admin-ledger";
const REFUND_KEY = "atobue-admin-refunds";
const DEFAULT_USER_ID = "USR-1001";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getLedgerEntries() {
  if (!canUseStorage()) {
    return INITIAL_LEDGER_ENTRIES;
  }
  const raw = window.localStorage.getItem(LEDGER_KEY);
  if (!raw) {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(INITIAL_LEDGER_ENTRIES));
    return INITIAL_LEDGER_ENTRIES;
  }
  try {
    const parsed = JSON.parse(raw) as Array<LedgerEntry & { userId?: string }>;
    return parsed.map((entry) => ({
      ...entry,
      userId: entry.userId ?? DEFAULT_USER_ID,
    }));
  } catch {
    return INITIAL_LEDGER_ENTRIES;
  }
}

export function setLedgerEntries(entries: LedgerEntry[]) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
}

export function getRefundEntries() {
  if (!canUseStorage()) {
    return INITIAL_REFUNDS;
  }
  const raw = window.localStorage.getItem(REFUND_KEY);
  if (!raw) {
    window.localStorage.setItem(REFUND_KEY, JSON.stringify(INITIAL_REFUNDS));
    return INITIAL_REFUNDS;
  }
  try {
    return JSON.parse(raw) as RefundRequest[];
  } catch {
    return INITIAL_REFUNDS;
  }
}

export function setRefundEntries(entries: RefundRequest[]) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(REFUND_KEY, JSON.stringify(entries));
}
