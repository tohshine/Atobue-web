export type UserVerificationStatus = "pending" | "approved" | "denied";

export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: "tenant" | "landlord" | "caretaker" | "admin";
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastSeen: string;
  totalTransactions: number;
  documentType: "national-id" | "passport" | "drivers-license";
  documentUrl: string;
  documentUploadedAt: string;
  verificationStatus: UserVerificationStatus;
};

const USERS: UserRecord[] = [
  {
    id: "USR-1001",
    fullName: "Mary Johnson",
    email: "mary.johnson@atobue.com",
    role: "tenant",
    status: "active",
    joinedAt: "2026-01-15T09:30:00.000Z",
    lastSeen: "2026-05-18T10:12:00.000Z",
    totalTransactions: 18,
    documentType: "national-id",
    documentUrl: "/decor/xelfcon-manage-feature-front.png",
    documentUploadedAt: "2026-05-10T09:12:00.000Z",
    verificationStatus: "pending",
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
    documentType: "passport",
    documentUrl: "/decor/xelfcon-space-feature-front.png",
    documentUploadedAt: "2026-04-30T08:45:00.000Z",
    verificationStatus: "approved",
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
    documentType: "drivers-license",
    documentUrl: "/decor/caretaker.png",
    documentUploadedAt: "2026-05-02T16:22:00.000Z",
    verificationStatus: "denied",
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
    documentType: "national-id",
    documentUrl: "/decor/properties.png",
    documentUploadedAt: "2026-05-11T11:20:00.000Z",
    verificationStatus: "pending",
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
    documentType: "passport",
    documentUrl: "/decor/xelfcon-more-1.png",
    documentUploadedAt: "2026-04-21T14:18:00.000Z",
    verificationStatus: "approved",
  },
];

export function getUsersStore() {
  return USERS;
}

export function updateUserVerificationInStore(userId: string, status: UserVerificationStatus) {
  const user = USERS.find((entry) => entry.id === userId);
  if (!user) {
    return null;
  }
  user.verificationStatus = status;
  user.lastSeen = new Date().toISOString();
  return user;
}
