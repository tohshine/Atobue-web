export type TransactionType = "inflow" | "outflow";
export type TransactionStatus = "completed" | "pending";
export type RefundStatus = "pending" | "approved" | "rejected";

export type LedgerEntry = {
  id: string;
  userId: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  source: string;
};

export type RefundRequest = {
  id: string;
  customer: string;
  reason: string;
  amount: number;
  status: RefundStatus;
  channel: string;
  requestedOn: string;
  reference: string;
};

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "TXN-1001",
    userId: "USR-1001",
    description: "Tenant rent collection",
    category: "Rent",
    amount: 125000,
    type: "inflow",
    status: "completed",
    date: "2026-05-17",
    source: "Bank Transfer",
  },
  {
    id: "TXN-1002",
    userId: "USR-1002",
    description: "Maintenance payment for Block C",
    category: "Operations",
    amount: 27500,
    type: "outflow",
    status: "completed",
    date: "2026-05-17",
    source: "Company Account",
  },
  {
    id: "TXN-1003",
    userId: "USR-1003",
    description: "Security service monthly bill",
    category: "Security",
    amount: 18000,
    type: "outflow",
    status: "pending",
    date: "2026-05-16",
    source: "Company Account",
  },
  {
    id: "TXN-1004",
    userId: "USR-1004",
    description: "Late fee settlement",
    category: "Penalty",
    amount: 8000,
    type: "inflow",
    status: "completed",
    date: "2026-05-16",
    source: "Wallet",
  },
  {
    id: "TXN-1005",
    userId: "USR-1005",
    description: "Facility insurance payout",
    category: "Insurance",
    amount: 62000,
    type: "inflow",
    status: "pending",
    date: "2026-05-15",
    source: "Insurance",
  },
  {
    id: "TXN-1006",
    userId: "USR-1001",
    description: "Commitment fee — VAC-3012 Lekki 2BR",
    category: "Commitment Fee",
    amount: 15000,
    type: "outflow",
    status: "completed",
    date: "2026-05-20",
    source: "Card",
  },
  {
    id: "TXN-1007",
    userId: "USR-1004",
    description: "Commitment fee — VAC-3018 VI Studio",
    category: "Commitment Fee",
    amount: 12000,
    type: "outflow",
    status: "completed",
    date: "2026-05-19",
    source: "Bank Transfer",
  },
  {
    id: "TXN-1008",
    userId: "USR-1004",
    description: "Commitment fee — VAC-3025 Yaba 1BR (refunded)",
    category: "Commitment Fee",
    amount: 10000,
    type: "outflow",
    status: "completed",
    date: "2026-05-17",
    source: "Wallet",
  },
  {
    id: "TXN-1009",
    userId: "USR-1001",
    description: "Commitment fee — VAC-3018 VI Studio (disputed)",
    category: "Commitment Fee",
    amount: 12000,
    type: "outflow",
    status: "completed",
    date: "2026-05-16",
    source: "Card",
  },
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: "RFD-4421",
    customer: "John Ugo",
    reason: "Duplicate transfer",
    amount: 12000,
    status: "pending",
    channel: "Bank Transfer",
    requestedOn: "2026-05-17",
    reference: "INV-1177",
  },
  {
    id: "RFD-4420",
    customer: "Mariam Bello",
    reason: "Overcharged service fee",
    amount: 4500,
    status: "approved",
    channel: "Wallet",
    requestedOn: "2026-05-16",
    reference: "INV-1161",
  },
  {
    id: "RFD-4418",
    customer: "Ken Nwosu",
    reason: "Cancelled booking",
    amount: 20000,
    status: "rejected",
    channel: "Card",
    requestedOn: "2026-05-14",
    reference: "INV-1102",
  },
];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
