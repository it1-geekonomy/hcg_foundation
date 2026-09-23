"use client";

import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  ContentStatus,
  PatientTestimonial,
  PatientTestimonialFields,
} from "@/domains/cms/lib/types";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";
import { SeoFieldsSection } from "@/domains/cms/ui/SeoFieldsSection";
import CmsRichTextEditor from "@/domains/cms/ui/CmsRichTextEditor";

export type PatientTestimonialFormValues = {
  title: string;
  shortDescription: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  patientTestimonialBannerFile: File | null;
  patientTestimonialBannerUrl: string | null;
  patientTestimonialMobileBannerFile: File | null;
  patientTestimonialMobileBannerUrl: string | null;
  patientTestimonialFileDoc: File | null;
  patientTestimonialFileUrl: string | null;
};

export const emptyPatientTestimonialForm = (): PatientTestimonialFormValues => ({
  title: "",
  shortDescription: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  patientTestimonialBannerFile: null,
  patientTestimonialBannerUrl: null,
  patientTestimonialMobileBannerFile: null,
  patientTestimonialMobileBannerUrl: null,
  patientTestimonialFileDoc: null,
  patientTestimonialFileUrl: null,
});

export function patientTestimonialToFormValues(testimonial: PatientTestimonial): PatientTestimonialFormValues {
  return {
    title: testimonial.title ?? "",
    shortDescription: testimonial.shortDescription ?? "",
    status: testimonial.status ?? "draft",
    metaTitle: testimonial.metaTitle ?? "",
    metaDescription: testimonial.metaDescription ?? "",
    schemaCode: testimonial.schemaCode ?? "",
    patientTestimonialBannerFile: null,
    patientTestimonialBannerUrl: testimonial.patientTestimonialBanner ?? null,
    patientTestimonialMobileBannerFile: null,
    patientTestimonialMobileBannerUrl: testimonial.patientTestimonialMobileBanner ?? null,
    patientTestimonialFileDoc: null,
    patientTestimonialFileUrl: testimonial.patientTestimonialFile ?? null,
  };
}

export function formValuesToFields(form: PatientTestimonialFormValues): PatientTestimonialFields {
  return {
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim() || undefined,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
  };
}

function norm(value?: string | null) {
  return (value ?? "").trim();
}

export function getPatientTestimonialPatch(
  initial: PatientTestimonialFormValues,
  current: PatientTestimonialFormValues
): {
  fields: Partial<PatientTestimonialFields>;
  file: {
    patientTestimonialBanner: File | null;
    patientTestimonialMobileBanner: File | null;
    patientTestimonialFile: File | null;
  } | null;
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<PatientTestimonialFields> = {};
  const keys: (keyof PatientTestimonialFields)[] = [
    "title",
    "shortDescription",
    "status",
    "metaTitle",
    "metaDescription",
    "schemaCode",
  ];

  for (const key of keys) {
    const before = prev[key];
    const after = next[key];
    if (norm(before as string) === norm(after as string)) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const fileChanges = {
    patientTestimonialBanner: current.patientTestimonialBannerFile,
    patientTestimonialMobileBanner: current.patientTestimonialMobileBannerFile,
    patientTestimonialFile: current.patientTestimonialFileDoc,
  };

  const hasFileChanges =
    fileChanges.patientTestimonialBanner ||
    fileChanges.patientTestimonialMobileBanner ||
    fileChanges.patientTestimonialFile;

  return {
    fields,
    file: hasFileChanges ? fileChanges : null,
    hasChanges: Object.keys(fields).length > 0 || !!hasFileChanges,
  };
}

type PatientTestimonialFormProps = {
  value: PatientTestimonialFormValues;
  onChange: (next: PatientTestimonialFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
};

export default function PatientTestimonialForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
}: PatientTestimonialFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Typography variant="heading-7" as="h2" className="font-semibold text-[#0D2838]">
          Testimonial Content
        </Typography>

        <CmsFormField label="Title *" htmlFor="title" hint="E.g. My Journey to Recovery">
          <Input
            id="title"
            required
            placeholder="Title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Short Description" htmlFor="shortDescription" hint="Short blurb for cards">
          <Textarea
            id="shortDescription"
            rows={3}
            placeholder="Short description..."
            value={value.shortDescription}
            onChange={(e) => onChange({ ...value, shortDescription: e.target.value })}
          />
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

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Typography variant="heading-7" as="h2" className="font-semibold text-[#0D2838]">
          Media
        </Typography>

        <CmsFormField
          label="Desktop Banner"
          htmlFor="patientTestimonialBanner"
          hint="Recommended: 1280x720 (16:9) WebP or AVIF (Max 5MB)"
        >
          <CmsImagePicker
            label="desktop banner"
            value={{
              file: value.patientTestimonialBannerFile,
              url: value.patientTestimonialBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                patientTestimonialBannerFile: file,
                patientTestimonialBannerUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Mobile Banner"
          htmlFor="patientTestimonialMobileBanner"
          hint="Recommended: 1280x720 (16:9) WebP or AVIF (Max 5MB)"
        >
          <CmsImagePicker
            label="mobile banner"
            value={{
              file: value.patientTestimonialMobileBannerFile,
              url: value.patientTestimonialMobileBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                patientTestimonialMobileBannerFile: file,
                patientTestimonialMobileBannerUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>
        
        <CmsFormField
          label="Testimonial Video"
          htmlFor="patientTestimonialFile"
          hint="Testimonial video (MP4, WebM)"
        >
          <div className="flex flex-col gap-2">
            <Input
              id="patientTestimonialFile"
              type="file"
              accept="video/mp4,video/webm"
              disabled={saving}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onChange({
                  ...value,
                  patientTestimonialFileDoc: file,
                });
              }}
            />
            {value.patientTestimonialFileUrl && !value.patientTestimonialFileDoc && (
              <a href={value.patientTestimonialFileUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
                View current video
              </a>
            )}
            {value.patientTestimonialFileDoc && (
              <span className="text-sm text-green-600">New video selected: {value.patientTestimonialFileDoc.name}</span>
            )}
          </div>
        </CmsFormField>
      </div>

      <SeoFieldsSection
        value={value}
        onChange={onChange}
        disabled={saving}
      />

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={saving || !value.title.trim()}
          className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
        >
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
