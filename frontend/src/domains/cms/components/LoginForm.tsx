"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/domains/cms/lib/auth-api";
import { useAuthStore } from "@/store/auth.store";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/dashboard";

  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin/dashboard");
    }
  }, [hasHydrated, isAuthenticated, nextPath, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(identifier.trim(), password);
      setSession({
        accessToken: res.data.accessToken,
        user: res.data.user,
      });
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!hasHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/footer/Logo.png"
          alt="HCG Foundation"
          width={200}
          height={64}
          className="mb-6 h-14 w-auto object-contain"
          priority
        />
        <h1 className="font-manrope text-2xl font-semibold tracking-tight text-white">
          Sign in
        </h1>
        <p className="mt-2 font-manrope text-sm text-white/45">
          Access the HCG Foundation content studio
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <label className="mb-4 block">
          <span className="mb-1.5 block font-manrope text-xs font-semibold tracking-wide text-white/50 uppercase">
            Email or username
          </span>
          <input
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 font-manrope text-sm text-white outline-none transition focus:border-[#FCCC2D]/50"
            placeholder="admin@hcg.org"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1.5 block font-manrope text-xs font-semibold tracking-wide text-white/50 uppercase">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 font-manrope text-sm text-white outline-none transition focus:border-[#FCCC2D]/50"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 font-manrope text-sm text-red-300 ring-1 ring-red-500/20">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-[#FCCC2D] px-4 py-2.5 font-manrope text-sm font-semibold text-[#141414] transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-5 text-center font-manrope text-xs text-white/35">
          <Link href="/" className="underline-offset-2 hover:text-white/60 hover:underline">
            Back to website
          </Link>
        </p>
      </form>
    </div>
  );
}
