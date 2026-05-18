import { NextResponse } from "next/server";

const USERS = [
  {
    id: "USR-1001",
    fullName: "Mary Johnson",
    email: "mary.johnson@atobue.com",
    role: "tenant",
    status: "active",
    joinedAt: "2026-01-15T09:30:00.000Z",
    lastSeen: "2026-05-18T10:12:00.000Z",
    totalTransactions: 18,
  },
  {
    id: "USR-1002",
    fullName: "Kelechi Okafor",
    email: "kelechi.okafor@atobue.com",
    role: "landlord",
    status: "active",
    joinedAt: "2025-11-10T08:12:00.000Z",
    lastSeen: "2026-05-18T09:42:00.000Z",
    totalTransactions: 34,
  },
  {
    id: "USR-1003",
    fullName: "Fatima Ibrahim",
    email: "fatima.ibrahim@atobue.com",
    role: "caretaker",
    status: "suspended",
    joinedAt: "2026-02-03T12:40:00.000Z",
    lastSeen: "2026-05-10T14:10:00.000Z",
    totalTransactions: 7,
  },
  {
    id: "USR-1004",
    fullName: "David Mensah",
    email: "david.mensah@atobue.com",
    role: "tenant",
    status: "active",
    joinedAt: "2026-03-21T10:15:00.000Z",
    lastSeen: "2026-05-17T19:01:00.000Z",
    totalTransactions: 12,
  },
  {
    id: "USR-1005",
    fullName: "Adaeze Nnaji",
    email: "adaeze.nnaji@atobue.com",
    role: "landlord",
    status: "inactive",
    joinedAt: "2025-09-02T07:12:00.000Z",
    lastSeen: "2026-04-28T13:20:00.000Z",
    totalTransactions: 51,
  },
];

export async function GET() {
  return NextResponse.json({
    users: USERS,
    total: USERS.length,
  });
}
