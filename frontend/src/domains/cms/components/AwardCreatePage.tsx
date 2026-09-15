"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import AwardForm, {
  emptyAwardForm,
  formValuesToFields,
  type AwardFormValues,
} from "./AwardForm";

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
          href="/admin/awards"
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Add award
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Upload a WebP/AVIF image. Set status to{" "}
          <strong>published</strong> to show on the website.
        </p>
      </div>

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
