"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import AnnualReportForm, {
  emptyAnnualReportForm,
  formValuesToFields,
  type AnnualReportFormValues,
} from "./AnnualReportForm";

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
          href="/admin/annual-reports"
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to list
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold text-[#212121]"
        >
          Add annual report
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Desktop banner, mobile banner, and PDF upload to R2. Set status to{" "}
          <strong>published</strong> when ready.
        </Typography>
      </div>

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
