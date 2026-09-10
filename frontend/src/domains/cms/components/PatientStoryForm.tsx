"use client";

import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  ContentStatus,
  CreatePatientStoryPayload,
  PatientStory,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "./CmsFormField";
import { SeoFieldsSection } from "./SeoFieldsSection";

const CmsRichTextEditor = dynamic(() => import("./CmsRichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-lg border border-input bg-white font-manrope text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export type PatientStoryFormValues = {
  title: string;
  slug: string;
  patientImage: string;
  storyDate: string;
  donationState: string;
  shortDescription: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
};

export function emptyPatientStoryForm(): PatientStoryFormValues {
  return {
    title: "",
    slug: "",
    patientImage: "",
    storyDate: "",
    donationState: "",
    shortDescription: "",
    content: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
    schemaCode: "",
  };
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

/** API may return ISO datetime — keep YYYY-MM-DD for date input */
function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function patientStoryToFormValues(
  story: PatientStory
): PatientStoryFormValues {
  return {
    title: story.title ?? "",
    slug: story.slug ?? "",
    patientImage: story.patientImage ?? "",
    storyDate: toDateInput(story.storyDate),
    donationState: story.donationState ?? "",
    shortDescription: story.shortDescription ?? "",
    content: story.content ?? "",
    status: story.status ?? "draft",
    metaTitle: story.metaTitle ?? "",
    metaDescription: story.metaDescription ?? "",
    schemaCode: story.schemaCode ?? "",
  };
}

export function formValuesToPayload(
  form: PatientStoryFormValues
): CreatePatientStoryPayload {
  const hasContent = form.content
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    patientImage: form.patientImage.trim() || undefined,
    storyDate: form.storyDate.trim() || undefined,
    donationState: form.donationState.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    content: hasContent ? form.content : undefined,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
  };
}

type PatientStoryFormProps = {
  value: PatientStoryFormValues;
  onChange: (next: PatientStoryFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

export default function PatientStoryForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
  slugLocked,
  onSlugManualEdit,
}: PatientStoryFormProps) {
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
            placeholder="Aarav’s recovery story"
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

        <CmsFormField label="Slug" htmlFor="slug">
          <Input
            id="slug"
            required
            value={value.slug}
            onChange={(e) => {
              onSlugManualEdit?.();
              onChange({ ...value, slug: e.target.value });
            }}
          />
        </CmsFormField>

        <CmsFormField label="Patient image URL" htmlFor="patientImage">
          <Input
            id="patientImage"
            placeholder="https://..."
            value={value.patientImage}
            onChange={(e) =>
              onChange({ ...value, patientImage: e.target.value })
            }
          />
          {value.patientImage ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-black/5 bg-[#F0EEE9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.patientImage}
                alt=""
                className="mx-auto h-40 object-contain"
              />
            </div>
          ) : null}
        </CmsFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Story date" htmlFor="storyDate">
            <Input
              id="storyDate"
              type="date"
              value={value.storyDate}
              onChange={(e) =>
                onChange({ ...value, storyDate: e.target.value })
              }
            />
          </CmsFormField>

          <CmsFormField label="Donation state" htmlFor="donationState">
            <Input
              id="donationState"
              placeholder="Karnataka"
              maxLength={250}
              value={value.donationState}
              onChange={(e) =>
                onChange({ ...value, donationState: e.target.value })
              }
            />
          </CmsFormField>
        </div>

        <CmsFormField label="Short description" htmlFor="shortDescription">
          <Textarea
            id="shortDescription"
            placeholder="Short blurb for cards"
            value={value.shortDescription}
            onChange={(e) =>
              onChange({ ...value, shortDescription: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField label="Content" htmlFor="content">
          <CmsRichTextEditor
            id="content"
            value={value.content}
            onChange={(content) => onChange({ ...value, content })}
            placeholder="Full patient story…"
          />
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
