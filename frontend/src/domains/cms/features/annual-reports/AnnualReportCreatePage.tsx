"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import AnnualReportForm, {
  emptyAnnualReportForm,
  formValuesToFields,
  type AnnualReportFormValues,
} from "./AnnualReportForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

export default function AnnualReportCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<AnnualReportFormValues>(
    emptyAnnualReportForm
  );
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim() || !form.slug.trim()) {
      cmsToast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      const res = await cmsApi.createAnnualReport(formValuesToFields(form), {
        banner: form.bannerFile,
        mobileBanner: form.mobileBannerFile,
        file: form.reportFile,
      });
      cmsToast.success(res.message || "Annual report created successfully");
      router.push(`/admin/annual-reports/${res.data.id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/annual-reports"
        title="Add annual report"
        description={
          <>
            Desktop banner, mobile banner, and PDF upload to R2. Set status to{" "}
            <strong>published</strong> when ready.
          </>
        }
      />

      <AnnualReportForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create report"
        saving={saving}
        slugLocked={slugLocked}
        onSlugManualEdit={() => setSlugLocked(true)}
      />
    </div>
  );
}
