"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { adminRoutes } from "@/lib/admin-path";
import { isAdminAuthenticated } from "../_lib/storage";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace(adminRoutes.login);
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(170deg,#040a14_0%,#0c1830_45%,#091328_100%)]">
        <p className="text-sm text-white/60">Loading console...</p>
      </main>
    );
  }

  return <>{children}</>;
}
