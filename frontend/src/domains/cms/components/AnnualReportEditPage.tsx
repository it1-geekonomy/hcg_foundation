"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { AnnualReport } from "@/domains/cms/lib/types";
import AnnualReportForm, {
  annualReportToFormValues,
  emptyAnnualReportForm,
  formValuesToFields,
  type AnnualReportFormValues,
} from "./AnnualReportForm";

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
          cmsToast.error(
            err instanceof Error ? err.message : "Failed to load"
          );
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
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to update"
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading editor…
      </Typography>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/annual-reports/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to view
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold text-[#212121]"
        >
          Edit annual report
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Leave file inputs empty to keep existing assets; pick a new file to
          replace.
        </Typography>
      </div>

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
