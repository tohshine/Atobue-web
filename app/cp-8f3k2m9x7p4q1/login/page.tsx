"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/lib/api";
import { setAuthSession } from "@/lib/auth/session";
import { adminRoutes } from "@/lib/admin-path";

const ADMIN_KEYWORDS = ["Finance", "Users", "Tickets", "Controls"] as const;

function AdminKeywords() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Admin areas">
      {ADMIN_KEYWORDS.map((word) => (
        <li
          key={word}
          className="pill border border-white/10 bg-white/6 px-3.5 py-1 text-[11px] tracking-[0.14em] text-white/75 uppercase"
        >
          {word}
        </li>
      ))}
    </ul>
  );
}

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_420px_at_50%_-10%,rgba(45,179,255,0.28),rgba(0,0,0,0)_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_360px_at_90%_100%,rgba(22,163,74,0.16),rgba(0,0,0,0)_70%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-5 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold leading-none tracking-tight md:text-5xl">
            <span className="text-(--brand)">Xelfcon</span>
          </h1>

          <div className="mt-5">
            <AdminKeywords />
          </div>

          <p className="mx-auto mt-4 max-w-[340px] text-sm leading-6 text-white/65">
            Sign in to manage finance, users, tickets, and platform controls.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 shadow-soft backdrop-blur md:p-6"
        >
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-white/60">Work Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@xelfcon.com"
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
