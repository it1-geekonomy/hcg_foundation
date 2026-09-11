"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import TeamForm, {
  emptyTeamForm,
  formValuesToFields,
  type TeamFormValues,
} from "./TeamForm";

export default function TeamCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<TeamFormValues>(emptyTeamForm);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim()) {
      cmsToast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const fields = formValuesToFields(form);
      const res = await cmsApi.createTeam(fields, {
        file: form.teamImageFile,
      });
      cmsToast.success(res.message || "Team member created successfully");
      router.push(`/admin/team/${res.data.id}`);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to create"
      );
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/team"
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Add team member
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Upload a photo. Set status to{" "}
          <strong>published</strong> to show on the website.
        </p>
      </div>

      <TeamForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create member"
        saving={saving}
      />
    </div>
  );
}
