"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  AnnualReport,
  AnnualReportFields,
  ContentStatus,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "./CmsFormField";
import { SeoFieldsSection } from "./SeoFieldsSection";

export type AnnualReportFormValues = {
  title: string;
  slug: string;
  reportYear: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  bannerFile: File | null;
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
  /** Existing R2 URLs when editing */
  existingBannerUrl?: string | null;
  existingFileUrl?: string | null;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

export default function AnnualReportForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
  existingBannerUrl,
  existingFileUrl,
  slugLocked,
  onSlugManualEdit,
}: AnnualReportFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
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
          hint="e.g. 2024-25"
        >
          <Input
            id="reportYear"
            placeholder="2024-25"
            maxLength={9}
            value={value.reportYear}
            onChange={(e) =>
              onChange({ ...value, reportYear: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Banner image"
          htmlFor="banner"
          hint="Uploaded to Cloudflare R2"
        >
          {existingBannerUrl ? (
            <div className="mb-2 flex h-40 items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-[#F0EEE9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingBannerUrl}
                alt="Current banner"
                className="max-h-full max-w-full object-contain p-2"
              />
            </div>
          ) : null}
          <Input
            id="banner"
            type="file"
            accept="image/*"
            onChange={(e) =>
              onChange({
                ...value,
                bannerFile: e.target.files?.[0] ?? null,
              })
            }
          />
          {value.bannerFile ? (
            <p className="font-manrope text-xs text-[#5C5C5C]">
              Selected: {value.bannerFile.name}
            </p>
          ) : null}
        </CmsFormField>

        <CmsFormField
          label="Report file (PDF)"
          htmlFor="file"
          hint="Uploaded to Cloudflare R2"
        >
          {existingFileUrl ? (
            <p className="mb-2 font-manrope text-xs">
              Current:{" "}
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
              >
                Open on CDN
              </a>
            </p>
          ) : null}
          <Input
            id="file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) =>
              onChange({
                ...value,
                reportFile: e.target.files?.[0] ?? null,
              })
            }
          />
          {value.reportFile ? (
            <p className="font-manrope text-xs text-[#5C5C5C]">
              Selected: {value.reportFile.name}
            </p>
          ) : null}
        </CmsFormField>

        <CmsFormField label="Status" htmlFor="status">
          <select
            id="status"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={value.status}
            onChange={(e) =>
              onChange({
                ...value,
                status: e.target.value as ContentStatus,
              })
            }
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
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
