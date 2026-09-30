"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PatientTestimonial } from "@/domains/cms/lib/types";
import { CmsFormPageHeader, CmsViewLoading, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import PatientTestimonialForm, {
  getPatientTestimonialPatch,
  patientTestimonialToFormValues,
  type PatientTestimonialFormValues,
} from "./PatientTestimonialForm";

export default function PatientTestimonialEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<PatientTestimonial | null>(null);
  const [value, setValue] = useState<PatientTestimonialFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getPatientTestimonial(id);
      setOriginal(res.data);
      setValue(patientTestimonialToFormValues(res.data));
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to load testimonial"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !original) return;
    if (!value.title.trim()) {
      cmsToast.error("Title is required.");
      return;
    }

    const initial = patientTestimonialToFormValues(original);
    const { fields, file, hasChanges } = getPatientTestimonialPatch(initial, value);

    if (!hasChanges) {
      cmsToast.success("No changes made");
      router.push(`/admin/patient-testimonials/${id}`);
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updatePatientTestimonial(id, fields, {
        patientTestimonialBanner: file?.patientTestimonialBanner,
        patientTestimonialMobileBanner: file?.patientTestimonialMobileBanner,
        patientTestimonialFile: file?.patientTestimonialFile,
      });
      cmsToast.success(res.message || "Testimonial updated successfully!");
      router.push(`/admin/patient-testimonials/${id}`);
      router.refresh();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update testimonial"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !value) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/patient-testimonials/${id}`}
        backLabel="Back to view"
        title="Edit Testimonial"
        description="Save sends only what you changed."
      />
      <PatientTestimonialForm
        value={value}
        onChange={setValue}
        onSubmit={onSubmit}
        submitLabel="Save Changes"
        saving={saving}
      />
    </div>
  );
}
