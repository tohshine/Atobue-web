import { redirect } from "next/navigation";
import { adminRoutes } from "@/lib/admin-path";

export default function AdminIndexPage() {
  redirect(adminRoutes.login);
}
