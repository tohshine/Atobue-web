export type UserVerificationStatus = "pending" | "approved" | "denied";

export type AdminUser = {
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

type UsersResponse = {
  users: AdminUser[];
  total: number;
};

export async function getUsers() {
  const response = await fetch("/api/users", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load users");
  }

  return (await response.json()) as UsersResponse;
}

export async function updateUserVerification(userId: string, status: UserVerificationStatus) {
  const response = await fetch(`/api/users/${userId}/verification`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Unable to update verification status");
  }

  return (await response.json()) as { user: AdminUser };
}
