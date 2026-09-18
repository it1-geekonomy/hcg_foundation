"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import AwardForm, {
  emptyAwardForm,
  formValuesToFields,
  type AwardFormValues,
} from "./AwardForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

export default function AwardCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<AwardFormValues>(emptyAwardForm);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim()) {
      cmsToast.error("Title is required");
      return;
    }
    if (!form.awardImageFile) {
      cmsToast.error("Award image is required");
      return;
    }
    setSaving(true);
    try {
      const res = await cmsApi.createAward(
        formValuesToFields(form),
        form.awardImageFile
      );
      cmsToast.success(res.message || "Award created successfully");
      router.push(`/admin/awards/${res.data.id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/awards"
        title="Add award"
        description={
          <>
            Upload a WebP/AVIF image. Set status to{" "}
            <strong>published</strong> to show on the website.
          </>
        }
      />

      <AwardForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create award"
        saving={saving}
        requireImage
      />
    </div>
  );
}
