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
    <main className="min-h-screen bg-[linear-gradient(170deg,#040a14_0%,#0c1830_45%,#091328_100%)] pb-8">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-(--brand)">Xelfcon Admin</p>
              <h1 className="truncate text-lg font-semibold leading-tight md:text-xl">{title}</h1>
              <p className="truncate text-xs text-white/55">{subtitle}</p>
            </div>
            <SignOutButton />
          </div>

          <nav className="flex gap-1.5 overflow-x-auto pb-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition",
                  active === item.href
                    ? "bg-(--brand) text-slate-900"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto mt-5 w-full max-w-[1440px] px-5">{children}</section>
    </main>
  );
}
