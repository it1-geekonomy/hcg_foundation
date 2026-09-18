"use client";

import dynamic from "next/dynamic";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  ContentStatus,
  CreateLegalPagePayload,
  LegalPage,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";
import { SeoFieldsSection } from "@/domains/cms/ui/SeoFieldsSection";

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
});

export type LegalPageFormValues = {
  title: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
};

export function emptyLegalPageForm(
  defaults?: Partial<Pick<LegalPageFormValues, "title">>
): LegalPageFormValues {
  return {
    title: defaults?.title ?? "",
    content: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
    schemaCode: "",
  };
}

export function legalPageToFormValues(page: LegalPage): LegalPageFormValues {
  return {
    title: page.title ?? "",
    content: page.content ?? "",
    status: page.status ?? "draft",
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
    schemaCode: page.schemaCode ?? "",
  };
}

export function formValuesToPayload(
  form: LegalPageFormValues
): CreateLegalPagePayload {
  const content = form.content.trim() ? form.content : "";

  return {
    title: form.title.trim(),
    content,
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
};

export default function LegalPageForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: LegalPageFormProps) {
  const hasContent = Boolean(
    value.content
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  );

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
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
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
        disabled={saving || !value.title.trim() || !hasContent}
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
