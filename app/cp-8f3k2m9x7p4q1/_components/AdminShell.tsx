import Link from "next/link";
import { ReactNode } from "react";
import { adminRoutes } from "@/lib/admin-path";
import SignOutButton from "./SignOutButton";

const NAV_ITEMS = [
  { href: adminRoutes.overview, label: "Overview" },
  { href: adminRoutes.users, label: "Users" },
  { href: adminRoutes.verification, label: "Verification" },
  { href: adminRoutes.conflicts, label: "Conflicts" },
  { href: adminRoutes.tickets, label: "Tickets" },
  { href: adminRoutes.ledger, label: "Ledger" },
  { href: adminRoutes.refunds, label: "Refunds" },
  { href: adminRoutes.controls, label: "Controls" },
];

export default function AdminShell({
  children,
  active,
  title,
  subtitle,
}: {
  children: ReactNode;
  active: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(170deg,#040a14_0%,#0c1830_45%,#091328_100%)] pb-10">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Xelfon Admin</p>
            <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex flex-wrap items-center gap-1 rounded-3xl border border-white/10 bg-white/5 p-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition md:px-4",
                    active === item.href ? "bg-(--brand) text-slate-900" : "text-white/70 hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto mt-6 w-full max-w-[1440px] px-5">{children}</section>
    </main>
  );
}
