"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import PatientStoryForm, {
  emptyPatientStoryForm,
  formValuesToPayload,
  type PatientStoryFormValues,
} from "./PatientStoryForm";

export default function PatientStoryCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<PatientStoryFormValues>(
    emptyPatientStoryForm
  );
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.createPatientStory(formValuesToPayload(form));
      router.push(`/admin/patients/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/patients"
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Add patient story
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Set status to <strong>published</strong> to show on the public site.
        </p>
      </div>

      <PatientStoryForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create story"
        saving={saving}
        error={error}
        slugLocked={slugLocked}
        onSlugManualEdit={() => setSlugLocked(true)}
      />
    </div>
  );
}
