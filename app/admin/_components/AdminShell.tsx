import Link from "next/link";
import { ReactNode } from "react";
import SignOutButton from "./SignOutButton";

const NAV_ITEMS = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/ledger", label: "Ledger" },
  { href: "/admin/refunds", label: "Refunds" },
  { href: "/admin/controls", label: "Controls" },
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
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Atobue Admin</p>
            <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
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

      <section className="container-page mt-6">{children}</section>
    </main>
  );
}
