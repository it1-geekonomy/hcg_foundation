"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cmsApi } from "@/domains/cms/lib/api";
import { CmsFormField } from "./CmsFormField";

const emptyForm = {
  fullName: "",
  slug: "",
  email: "",
  username: "",
  password: "",
};

export default function UserCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await cmsApi.createUser({
        fullName: form.fullName.trim(),
        slug: form.slug.trim() || undefined,
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
          Create user
        </h2>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Admin account only — no SEO fields.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
      >
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <CmsFormField label="Full Name" htmlFor="fullName">
          <Input
            id="fullName"
            required
            placeholder="Admin User"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Slug" htmlFor="slug" hint="Optional unique slug">
          <Input
            id="slug"
            placeholder="admin-user"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            placeholder="admin@hcgfoundation.org"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Username" htmlFor="username">
          <Input
            id="username"
            required
            placeholder="admin"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </CmsFormField>

        <Button
          type="submit"
          disabled={saving}
          className="h-11 w-full bg-[#FCCC2D] text-[#212121] hover:brightness-105"
        >
          {saving ? "Creating…" : "Create user"}
        </Button>
      </form>
    </div>
  );
}
