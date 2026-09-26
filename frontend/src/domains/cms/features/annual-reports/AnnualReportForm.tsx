"use client";

import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  AnnualReport,
  AnnualReportFields,
  ContentStatus,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";
import { SeoFieldsSection } from "@/domains/cms/ui/SeoFieldsSection";
import {
  ANNUAL_REPORT_BANNER_SIZE,
  ANNUAL_REPORT_MOBILE_BANNER_SIZE,
} from "@/domains/resources/Transparencyhub/constants/annualreport";

export type AnnualReportFormValues = {
  title: string;
  slug: string;
  reportYear: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  bannerFile: File | null;
  mobileBannerFile: File | null;
  reportFile: File | null;
};

export const emptyAnnualReportForm = (): AnnualReportFormValues => ({
  title: "",
  slug: "",
  reportYear: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  bannerFile: null,
  mobileBannerFile: null,
  reportFile: null,
});

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

export function annualReportToFormValues(
  report: AnnualReport
): AnnualReportFormValues {
  return {
    title: report.title ?? "",
    slug: report.slug ?? "",
    reportYear: report.reportYear ?? "",
    status: report.status ?? "draft",
    metaTitle: report.metaTitle ?? "",
    metaDescription: report.metaDescription ?? "",
    schemaCode: report.schemaCode ?? "",
    bannerFile: null,
    mobileBannerFile: null,
    reportFile: null,
  };
}

export function formValuesToFields(
  form: AnnualReportFormValues
): AnnualReportFields {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    reportYear: form.reportYear.trim() || undefined,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
  };
}

type AnnualReportFormProps = {
  value: AnnualReportFormValues;
  onChange: (next: AnnualReportFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
  existingBannerUrl?: string | null;
  existingMobileBannerUrl?: string | null;
  existingFileUrl?: string | null;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

function previewUrl(url?: string | null) {
  return url && url.trim() ? url.trim() : null;
}

export default function AnnualReportForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
  existingBannerUrl,
  existingMobileBannerUrl,
  existingFileUrl,
  slugLocked,
  onSlugManualEdit,
}: AnnualReportFormProps) {
  const bannerUrl = previewUrl(existingBannerUrl);
  const mobileBannerUrl = previewUrl(existingMobileBannerUrl);
  const fileUrl = previewUrl(existingFileUrl);

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      {error ? (
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error}
        </Typography>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Annual Report 2024-25"
            value={value.title}
            onChange={(e) => {
              const title = e.target.value;
              onChange({
                ...value,
                title,
                slug: slugLocked ? value.slug : slugifyTitle(title),
              });
            }}
          />
        </CmsFormField>

        <CmsFormField
          label="Slug"
          htmlFor="slug"
          hint="URL-safe id; auto-fills from title until you edit it"
        >
          <Input
            id="slug"
            required
            placeholder="annual-report-2024-25"
            value={value.slug}
            onChange={(e) => {
              onSlugManualEdit?.();
              onChange({ ...value, slug: e.target.value });
            }}
          />
        </CmsFormField>

        <CmsFormField
          label="Report year"
          htmlFor="reportYear"
          hint="Max 9 chars, e.g. 2024-25 or 2024-2025"
        >
          <Input
            id="reportYear"
            placeholder="2024-2025"
            maxLength={9}
            value={value.reportYear}
            onChange={(e) =>
              onChange({ ...value, reportYear: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Desktop / web banner"
          htmlFor="annualReportBanner"
          hint={`WebP or AVIF · recommended size ${ANNUAL_REPORT_BANNER_SIZE.width} × ${ANNUAL_REPORT_BANNER_SIZE.height}px (1920px desktop width banner)`}
        >
          <CmsImagePicker
            label="desktop banner"
            value={{
              file: value.bannerFile,
              url: bannerUrl,
            }}
            onChange={({ file }) =>
              onChange({
                ...value,
                bannerFile: file,
              })
            }
            requiredSize={ANNUAL_REPORT_BANNER_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Mobile banner"
          htmlFor="annualReportMobileBanner"
          hint={`WebP or AVIF · recommended size ${ANNUAL_REPORT_MOBILE_BANNER_SIZE.width} × ${ANNUAL_REPORT_MOBILE_BANNER_SIZE.height}px (mobile banner)`}
        >
          <CmsImagePicker
            label="mobile banner"
            value={{
              file: value.mobileBannerFile,
              url: mobileBannerUrl,
            }}
            onChange={({ file }) =>
              onChange({
                ...value,
                mobileBannerFile: file,
              })
            }
            requiredSize={ANNUAL_REPORT_MOBILE_BANNER_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Report file"
          htmlFor="annualReportFile"
          hint="PDF or Word, max 25MB → annualReportFile"
        >
          {fileUrl ? (
            <Typography variant="caption-1" as="p" className="mb-2">
              Current:{" "}
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
              >
                Open on CDN
              </a>
            </Typography>
          ) : null}
          <Input
            id="annualReportFile"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) =>
              onChange({
                ...value,
                reportFile: e.target.files?.[0] ?? null,
              })
            }
          />
          {value.reportFile ? (
            <Typography variant="caption-1" as="p" className="text-[#5C5C5C]">
              Selected: {value.reportFile.name}
            </Typography>
          ) : null}
        </CmsFormField>

        <CmsFormField label="Status" htmlFor="status">
          <CmsSelect
            id="status"
            value={value.status}
            options={CONTENT_STATUS_OPTIONS}
            onChange={(status) =>
              onChange({
                ...value,
                status: status as ContentStatus,
              })
            }
          />
        </CmsFormField>
      </div>

      <SeoFieldsSection
        value={{
          metaTitle: value.metaTitle,
          metaDescription: value.metaDescription,
          schemaCode: value.schemaCode,
        }}
        onChange={(seo) => onChange({ ...value, ...seo })}
      />

      <Button
        type="submit"
        disabled={saving || !value.title.trim() || !value.slug.trim()}
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
