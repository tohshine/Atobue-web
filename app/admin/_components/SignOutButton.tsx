"use client";

import { useRouter } from "next/navigation";
import { clearAdminSession } from "../_lib/storage";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    clearAdminSession();
    router.replace("/admin/login");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-400/20"
    >
      Sign out
    </button>
  );
}
