"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { AnnualReport } from "@/domains/cms/lib/types";
import AnnualReportForm, {
  annualReportToFormValues,
  emptyAnnualReportForm,
  formValuesToFields,
  type AnnualReportFormValues,
} from "./AnnualReportForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function AnnualReportEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [form, setForm] = useState<AnnualReportFormValues>(
    emptyAnnualReportForm
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getAnnualReport(id);
        if (!cancelled) {
          setReport(res.data);
          setForm(annualReportToFormValues(res.data));
        }
      } catch (err) {
        if (!cancelled) {
          cmsToast.error(cmsErrorMessage(err, "Failed to load"));
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
    setSaving(true);
    try {
      const res = await cmsApi.updateAnnualReport(
        id,
        formValuesToFields(form),
        {
          banner: form.bannerFile,
          mobileBanner: form.mobileBannerFile,
          file: form.reportFile,
        }
      );
      cmsToast.success(res.message || "Annual report updated successfully");
      router.push(`/admin/annual-reports/${id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update"));
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/annual-reports/${id}`}
        backLabel="Back to view"
        title="Edit annual report"
        description="Leave file inputs empty to keep existing assets; pick a new file to replace."
      />

      <AnnualReportForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
        existingBannerUrl={report?.annualReportBanner}
        existingMobileBannerUrl={report?.annualReportMobileBanner}
        existingFileUrl={report?.annualReportFile}
        slugLocked
      />
    </div>
  );
}
