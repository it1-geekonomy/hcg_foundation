"use client";

import dynamic from "next/dynamic";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  ContentStatus,
  PatientStory,
  PatientStoryFields,
} from "@/domains/cms/lib/types";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";
import { SeoFieldsSection } from "@/domains/cms/ui/SeoFieldsSection";
import { PATIENT_STORY_IMAGE_SIZE } from "@/domains/journey-of-hope/constants/stories";

const CmsRichTextEditor = dynamic(
  () => import("@/domains/cms/ui/CmsRichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <Typography
        variant="label-1"
        as="div"
        className="flex h-[360px] items-center justify-center rounded-lg border border-input bg-white text-muted-foreground"
      >
        Loading editor…
      </Typography>
    ),
  }
);

export type PatientStoryFormValues = {
  title: string;
  slug: string;
  storyDate: string;
  shortDescription: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  patientImageFile: File | null;
  patientImageUrl: string | null;
};

export const emptyPatientStoryForm = (): PatientStoryFormValues => ({
  title: "",
  slug: "",
  storyDate: "",
  shortDescription: "",
  content: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  patientImageFile: null,
  patientImageUrl: null,
});

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

export function patientStoryToFormValues(story: PatientStory): PatientStoryFormValues {
  return {
    title: story.title ?? "",
    slug: story.slug ?? "",
    storyDate: story.storyDate ? String(story.storyDate).slice(0, 10) : "",
    shortDescription: story.shortDescription ?? "",
    content: story.content ?? "",
    status: story.status ?? "draft",
    metaTitle: story.metaTitle ?? "",
    metaDescription: story.metaDescription ?? "",
    schemaCode: story.schemaCode ?? "",
    patientImageFile: null,
    patientImageUrl: story.patientImage ?? null,
  };
}

export function formValuesToFields(form: PatientStoryFormValues): PatientStoryFields {
  const plainContent = form.content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    storyDate: form.storyDate.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    content: plainContent ? form.content : undefined,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
  };
}

function norm(value?: string | null) {
  return (value ?? "").trim();
}

function normHtml(value?: string | null) {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "<br>")
    .trim();
}

export function getPatientStoryPatch(
  initial: PatientStoryFormValues,
  current: PatientStoryFormValues
): {
  fields: Partial<PatientStoryFields>;
  file: File | null;
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<PatientStoryFields> = {};
  const keys: (keyof PatientStoryFields)[] = [
    "title",
    "slug",
    "storyDate",
    "shortDescription",
    "status",
    "metaTitle",
    "metaDescription",
    "schemaCode",
  ];

  for (const key of keys) {
    const before = prev[key];
    const after = next[key];
    if (norm(before) === norm(after)) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  if (normHtml(prev.content) !== normHtml(next.content)) {
    fields.content = next.content ?? "";
  }

  const file = current.patientImageFile;
  return {
    fields,
    file,
    hasChanges: Object.keys(fields).length > 0 || !!file,
  };
}

type PatientStoryFormProps = {
  value: PatientStoryFormValues;
  onChange: (next: PatientStoryFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
};

export default function PatientStoryForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
}: PatientStoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Typography variant="heading-7" as="h2" className="font-semibold text-[#0D2838]">
          Story Details
        </Typography>

        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="John Doe Recovery Journey"
            value={value.title}
            onChange={(e) => {
              const title = e.target.value;
              const shouldSlug = !value.slug || value.slug === slugifyTitle(value.title);
              onChange({
                ...value,
                title,
                slug: shouldSlug ? slugifyTitle(title) : value.slug,
              });
            }}
          />
        </CmsFormField>

        <CmsFormField
          label="Slug"
          htmlFor="slug"
          hint="URL-friendly identifier used in website links"
        >
          <Input
            id="slug"
            required
            placeholder="john-doe-recovery-journey"
            value={value.slug}
            onChange={(e) => onChange({ ...value, slug: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Story Date" htmlFor="storyDate">
          <Input
            id="storyDate"
            type="date"
            value={value.storyDate}
            onChange={(e) =>
              onChange({ ...value, storyDate: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Patient Photo"
          htmlFor="patientImage"
          hint={`WebP or AVIF · exact size ${PATIENT_STORY_IMAGE_SIZE.width} × ${PATIENT_STORY_IMAGE_SIZE.height}px (same crop on mobile & desktop)`}
        >
          <CmsImagePicker
            label="patient photo"
            value={{
              file: value.patientImageFile,
              url: value.patientImageUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                patientImageFile: file,
                patientImageUrl: url,
              })
            }
            requiredSize={PATIENT_STORY_IMAGE_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Short Description"
          htmlFor="shortDescription"
          hint="Brief blurb shown on listing cards"
        >
          <Textarea
            id="shortDescription"
            rows={3}
            placeholder="A brief summary of the patient journey and support provided..."
            value={value.shortDescription}
            onChange={(e) =>
              onChange({ ...value, shortDescription: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Full Story Narrative"
          htmlFor="content"
          hint="Comprehensive narrative and testimonial"
        >
          <CmsRichTextEditor
            value={value.content}
            onChange={(content) => onChange({ ...value, content })}
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

      <SeoFieldsSection
        value={{
          metaTitle: value.metaTitle,
          metaDescription: value.metaDescription,
          schemaCode: value.schemaCode,
        }}
        onChange={(seo) => onChange({ ...value, ...seo })}
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
