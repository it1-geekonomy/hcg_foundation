"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import PatientTestimonialForm, {
  emptyPatientTestimonialForm,
  formValuesToFields,
  type PatientTestimonialFormValues,
} from "./PatientTestimonialForm";

export default function PatientTestimonialCreatePage() {
  const router = useRouter();
  const [value, setValue] = useState<PatientTestimonialFormValues>(
    emptyPatientTestimonialForm()
  );
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.title.trim()) {
      cmsToast.error("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.createPatientTestimonial(
        formValuesToFields(value),
        {
          patientTestimonialBanner: value.patientTestimonialBannerFile,
          patientTestimonialMobileBanner: value.patientTestimonialMobileBannerFile,
          patientTestimonialFile: value.patientTestimonialFileDoc,
        }
      );
      cmsToast.success(res.message || "Testimonial created successfully!");
      router.push(`/admin/patient-testimonials/${res.data.id}`);
      router.refresh();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create testimonial"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/patient-testimonials"
        title="Add Patient Testimonial"
        description="Create a new testimonial with content and media."
      />
      <PatientTestimonialForm
        value={value}
        onChange={setValue}
        onSubmit={onSubmit}
        submitLabel="Create Testimonial"
        saving={saving}
      />
    </div>
  );
}
