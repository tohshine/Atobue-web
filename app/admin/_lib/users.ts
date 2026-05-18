export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "tenant" | "landlord" | "caretaker" | "admin";
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastSeen: string;
  totalTransactions: number;
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
