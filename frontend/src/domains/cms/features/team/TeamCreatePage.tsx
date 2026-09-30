"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import TeamForm, {
  emptyTeamForm,
  formValuesToFields,
  type TeamFormValues,
} from "./TeamForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

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
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/team"
        title="Add team member / trustee"
        description={
          <>
            Photo must be exactly{" "}
            <strong>960 × 1140px</strong> (320:380 WebP/AVIF). Choose{" "}
            <strong>Team</strong> or <strong>Trustee</strong>, set status to{" "}
            <strong>published</strong> to show on About Us.
          </>
        }
      />

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
