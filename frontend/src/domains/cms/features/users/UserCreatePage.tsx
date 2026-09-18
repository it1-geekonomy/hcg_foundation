"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cmsApi } from "@/domains/cms/lib/api";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

const emptyForm = {
  fullName: "",
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
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      router.push("/admin/users");
    } catch (err) {
      setError(cmsErrorMessage(err, "Failed to create user"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/users"
        backLabel="Back to users"
        title="Create user"
        description="Admin account only — no SEO fields."
      />

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
      >
        {error ? (
          <Typography
            variant="label-1"
            as="div"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            {error}
          </Typography>
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
