"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Typography from "@/lib/Typography";
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
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="flex min-h-[40vh] items-center justify-center text-white/50">
        <Typography variant="label-1" as="span">
          Loading…
        </Typography>
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
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold tracking-tight text-white"
        >
          Sign in
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-2 text-white/45"
        >
          Access the HCG Foundation content studio
        </Typography>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <label className="mb-4 block">
          <Typography
            variant="caption-1"
            as="span"
            className="mb-1.5 block font-semibold tracking-wide text-white/50 uppercase"
          >
            Email or username
          </Typography>
          <input
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 font-manrope text-white outline-none transition focus:border-[#FCCC2D]/50"
            placeholder="admin@hcg.org"
          />
        </label>

        <label className="mb-5 block">
          <Typography
            variant="caption-1"
            as="span"
            className="mb-1.5 block font-semibold tracking-wide text-white/50 uppercase"
          >
            Password
          </Typography>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141414] py-2.5 pr-11 pl-3.5 font-manrope text-white outline-none transition focus:border-[#FCCC2D]/50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </label>

        {error ? (
          <Typography
            variant="label-1"
            as="p"
            className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-red-300 ring-1 ring-red-500/20"
          >
            {error}
          </Typography>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-[#FCCC2D] px-4 py-2.5 text-[#141414] transition hover:brightness-105 disabled:opacity-60"
        >
          <Typography variant="button-3" as="span">
            {loading ? "Signing in…" : "Sign in"}
          </Typography>
        </button>

        <Typography
          variant="caption-1"
          as="p"
          className="mt-5 text-center text-white/35"
        >
          <Link href="/" className="underline-offset-2 hover:text-white/60 hover:underline">
            Back to website
          </Link>
        </Typography>
      </form>
    </div>
  );
}
