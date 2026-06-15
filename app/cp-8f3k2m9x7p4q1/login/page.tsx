"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/lib/api";
import { setAuthSession } from "@/lib/auth/session";
import { adminRoutes } from "@/lib/admin-path";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setValidationError(true);
      setApiError(null);
      return;
    }

    setValidationError(false);
    setApiError(null);

    try {
      const { user, access_token } = await login({ email: email.trim(), password }).unwrap();
      setAuthSession({ user, accessToken: access_token, rememberMe });
      router.push(adminRoutes.overview);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to sign in. Check your credentials and try again.";
      setApiError(message);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(150deg,#050c16_0%,#0d1b34_40%,#0b1530_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_5%_5%,rgba(45,179,255,0.28),rgba(0,0,0,0)_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(700px_450px_at_95%_95%,rgba(22,163,74,0.24),rgba(0,0,0,0)_70%)]" />

      <section className="container-page relative z-10 flex min-h-screen items-center py-10">
        <div className="grid w-full gap-8 md:grid-cols-[1fr_1.1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-soft backdrop-blur md:p-9">
            <p className="pill bg-white/8 text-white/90">Xelfon Admin Suite</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              Elegant control center for finance and operations
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Manage revenue inflow, operational outflow, customer refunds, and priority admin actions from one
              streamlined dashboard.
            </p>
            <div className="mt-7 grid gap-4 text-sm text-white/80">
              <div className="card-soft rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Realtime finance visibility</p>
                <p className="mt-1">Ledger snapshots update instantly when entries are added or refunded.</p>
              </div>
              <div className="card-soft rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Refund governance</p>
                <p className="mt-1">Approve, reject, and audit payout requests with clear accountability.</p>
              </div>
            </div>
          </aside>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 shadow-soft backdrop-blur md:p-8">
            <h2 className="text-2xl font-semibold">Admin Login</h2>
            <p className="mt-2 text-sm text-white/65">Sign in to access ledger, refunds, and platform controls.</p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-white/60">Work Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@xelfon.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-(--brand) disabled:opacity-60"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wide text-white/60">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-(--brand) disabled:opacity-60"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                Keep me signed in on this device
              </label>

              {validationError && (
                <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  Provide both email and password to continue.
                </div>
              )}

              {apiError && (
                <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-(--brand) px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign In to Admin Console"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
