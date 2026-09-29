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
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-8 flex justify-center">
        <Image
          src="/footer/Logo.png"
          alt="HCG Foundation"
          width={290}
          height={99}
          unoptimized
          className="h-[88px] w-auto object-contain"
          priority
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-cms-border bg-white p-7 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-6">
          <Typography variant="heading-8" as="h1" className="text-cms-ink">
            Sign in
          </Typography>
          <Typography variant="label-1" as="p" className="mt-1 text-cms-muted">
            Access the HCG Foundation content studio
          </Typography>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-cms-body">
            Email or username
          </span>
          <input
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-10 w-full rounded-lg border border-cms-border bg-white px-3 text-sm text-cms-ink outline-none transition placeholder:text-cms-faint focus:border-cms-primary/60 focus:ring-3 focus:ring-cms-primary/15"
            placeholder="admin@hcg.org"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1.5 block text-[13px] font-medium text-cms-body">
            Password
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-cms-border bg-white pr-11 pl-3 text-sm text-cms-ink outline-none transition placeholder:text-cms-faint focus:border-cms-primary/60 focus:ring-3 focus:ring-cms-primary/15"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-cms-muted transition hover:text-cms-ink"
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
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
          >
            {error}
          </Typography>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-cms-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-cms-primary-hover disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <Typography
          variant="caption-1"
          as="p"
          className="mt-5 text-center text-cms-muted"
        >
          <Link href="/" className="underline-offset-2 hover:text-cms-ink hover:underline">
            Back to website
          </Link>
        </Typography>
      </form>
    </div>
  );
}
