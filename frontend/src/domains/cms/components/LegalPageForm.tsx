"use client";

import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  ContentStatus,
  CreateLegalPagePayload,
  LegalPage,
  LegalPageType,
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

export type LegalPageFormValues = {
  title: string;
  slug: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
};

export function emptyLegalPageForm(
  defaults?: Partial<Pick<LegalPageFormValues, "title" | "slug">>
): LegalPageFormValues {
  return {
    title: defaults?.title ?? "",
    slug: defaults?.slug ?? "",
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

export function legalPageToFormValues(page: LegalPage): LegalPageFormValues {
  return {
    title: page.title ?? "",
    slug: page.slug ?? "",
    content: page.content ?? "",
    status: page.status ?? "draft",
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
    schemaCode: page.schemaCode ?? "",
  };
}

export function formValuesToPayload(
  form: LegalPageFormValues,
  pageType: LegalPageType
): CreateLegalPagePayload {
  const hasContent = form.content
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    content: hasContent ? form.content : undefined,
    pageType,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
  };
}

type LegalPageFormProps = {
  value: LegalPageFormValues;
  onChange: (next: LegalPageFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

export default function LegalPageForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
  slugLocked,
  onSlugManualEdit,
}: LegalPageFormProps) {
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

        <CmsFormField label="Content" htmlFor="content">
          <CmsRichTextEditor
            id="content"
            value={value.content}
            onChange={(content) => onChange({ ...value, content })}
            placeholder="Write the full policy text…"
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
