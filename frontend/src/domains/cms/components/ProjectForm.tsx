"use client";

import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  CmsProject,
  ContentStatus,
  ProjectFields,
} from "@/domains/cms/lib/types";
import CmsImagePicker from "./CmsImagePicker";
import { CmsFormField } from "./CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "./CmsSelect";
import { SeoFieldsSection } from "./SeoFieldsSection";

const CmsRichTextEditor = dynamic(() => import("./CmsRichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-lg border border-input bg-white font-manrope text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export type ProjectFormValues = {
  title: string;
  slug: string;
  projectDate: string;
  shortDescription: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  displayOrder: string;
  projectBannerFile: File | null;
  projectBannerUrl: string | null;
  projectMobileBannerFile: File | null;
  projectMobileBannerUrl: string | null;
};

export const emptyProjectForm = (): ProjectFormValues => ({
  title: "",
  slug: "",
  projectDate: "",
  shortDescription: "",
  content: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  displayOrder: "1",
  projectBannerFile: null,
  projectBannerUrl: null,
  projectMobileBannerFile: null,
  projectMobileBannerUrl: null,
});

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

export function projectToFormValues(project: CmsProject): ProjectFormValues {
  return {
    title: project.title ?? "",
    slug: project.slug ?? "",
    projectDate: project.projectDate ?? "",
    shortDescription: project.shortDescription ?? "",
    content: project.content ?? "",
    status: project.status ?? "draft",
    metaTitle: project.metaTitle ?? "",
    metaDescription: project.metaDescription ?? "",
    schemaCode: project.schemaCode ?? "",
    displayOrder:
      project.displayOrder != null ? String(project.displayOrder) : "1",
    projectBannerFile: null,
    projectBannerUrl: project.projectBanner ?? null,
    projectMobileBannerFile: null,
    projectMobileBannerUrl: project.projectMobileBanner ?? null,
  };
}

export function formValuesToFields(form: ProjectFormValues): ProjectFields {
  const plainContent = form.content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const order = Number.parseInt(form.displayOrder.trim(), 10);

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    projectDate: form.projectDate.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    content: plainContent ? form.content : undefined,
    displayOrder: Number.isFinite(order) && order > 0 ? order : 1,
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

export function getProjectPatch(
  initial: ProjectFormValues,
  current: ProjectFormValues
): {
  fields: Partial<ProjectFields>;
  files: {
    projectBanner: File | null;
    projectMobileBanner: File | null;
  };
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<ProjectFields> = {};
  const keys: (keyof ProjectFields)[] = [
    "title",
    "slug",
    "projectDate",
    "shortDescription",
    "content",
    "displayOrder",
    "status",
    "metaTitle",
    "metaDescription",
    "schemaCode",
  ];

  for (const key of keys) {
    const before = prev[key];
    const after = next[key];
    const equal =
      key === "content"
        ? normHtml(before as string | undefined) ===
          normHtml(after as string | undefined)
        : key === "displayOrder"
          ? before === after
          : norm(before as string | undefined) ===
            norm(after as string | undefined);
    if (equal) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const files = {
    projectBanner: current.projectBannerFile,
    projectMobileBanner: current.projectMobileBannerFile,
  };

  return {
    fields,
    files,
    hasChanges:
      Object.keys(fields).length > 0 ||
      !!files.projectBanner ||
      !!files.projectMobileBanner,
  };
}

type ProjectFormProps = {
  value: ProjectFormValues;
  onChange: (next: ProjectFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

export default function ProjectForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  slugLocked,
  onSlugManualEdit,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Clean Water Initiative"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Date" htmlFor="projectDate">
            <Input
              id="projectDate"
              type="date"
              value={value.projectDate}
              onChange={(e) =>
                onChange({ ...value, projectDate: e.target.value })
              }
            />
          </CmsFormField>

          <CmsFormField
            label="Display order"
            htmlFor="displayOrder"
            hint="Lower numbers appear first on the website"
          >
            <Input
              id="displayOrder"
              type="number"
              min={1}
              inputMode="numeric"
              value={value.displayOrder}
              onChange={(e) =>
                onChange({ ...value, displayOrder: e.target.value })
              }
            />
          </CmsFormField>
        </div>

        <CmsFormField
          label="Desktop / web banner"
          htmlFor="projectBanner"
          hint="WebP or AVIF, max 5MB"
        >
          <CmsImagePicker
            label="desktop banner"
            value={{
              file: value.projectBannerFile,
              url: value.projectBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                projectBannerFile: file,
                projectBannerUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Mobile banner"
          htmlFor="projectMobileBanner"
          hint="WebP or AVIF, max 5MB"
        >
          <CmsImagePicker
            label="mobile banner"
            value={{
              file: value.projectMobileBannerFile,
              url: value.projectMobileBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                projectMobileBannerFile: file,
                projectMobileBannerUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>

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
            placeholder="Full project details…"
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
        disabled={saving || !value.title.trim() || !value.slug.trim()}
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
