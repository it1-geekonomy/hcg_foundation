"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import PatientStoryForm, {
  emptyPatientStoryForm,
  formValuesToFields,
  type PatientStoryFormValues,
} from "./PatientStoryForm";
import {
  CmsFormPageHeader,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/patients";

export default function PatientStoryCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<PatientStoryFormValues>(emptyPatientStoryForm);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      cmsToast.error("Please enter a title for the story");
      return;
    }

    setSaving(true);
    try {
      const fields = formValuesToFields(form);
      const res = await cmsApi.createPatientStory(fields, form.patientImageFile);
      cmsToast.success(res.message || "Patient story created successfully");
      router.push(`/admin/patients/${res.data.id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create patient story"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={LIST_HREF}
        title="Add patient story"
        description="Create a new inspirational patient journey with portrait image and rich narrative."
      />
      <PatientStoryForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create patient story"
        saving={saving}
      />
    </div>
  );
}
