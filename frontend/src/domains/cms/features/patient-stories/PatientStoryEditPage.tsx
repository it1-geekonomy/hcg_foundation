"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import PatientStoryForm, {
  emptyPatientStoryForm,
  getPatientStoryPatch,
  patientStoryToFormValues,
  type PatientStoryFormValues,
} from "./PatientStoryForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function PatientStoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<PatientStoryFormValues>(emptyPatientStoryForm);
  const [initial, setInitial] = useState<PatientStoryFormValues>(emptyPatientStoryForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getPatientStory(id);
        if (!cancelled) {
          const values = patientStoryToFormValues(res.data);
          setForm(values);
          setInitial({ ...values });
        }
      } catch (err) {
        if (!cancelled) {
          cmsToast.error(cmsErrorMessage(err, "Failed to load patient story"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || saving) return;

    const patch = getPatientStoryPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updatePatientStory(id, patch.fields, patch.file);
      cmsToast.success(res.message || "Patient story updated successfully");
      router.push(`/admin/patients/${id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update patient story"));
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/patients/${id}`}
        backLabel="Back to view"
        title="Edit patient story"
        description="Save sends only what you changed."
      />

      <PatientStoryForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
      />
    </div>
  );
}
