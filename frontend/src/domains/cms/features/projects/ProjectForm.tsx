"use client";

import dynamic from "next/dynamic";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  CmsProject,
  ContentStatus,
  DisplayOrderMode,
  ProjectFields,
} from "@/domains/cms/lib/types";
import CmsDisplayOrderField, {
  orderModeForPatch,
} from "@/domains/cms/ui/CmsDisplayOrderField";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";
import { SeoFieldsSection } from "@/domains/cms/ui/SeoFieldsSection";
import {
  PROJECT_BANNER_SIZE,
  PROJECT_MOBILE_BANNER_SIZE,
} from "@/domains/home/constants/project";

const CmsRichTextEditor = dynamic(
  () => import("@/domains/cms/ui/CmsRichTextEditor"),
  {
  ssr: false,
  loading: () => (
    <Typography
      variant="label-1"
      as="div"
      className="flex h-[360px] items-center justify-center rounded-lg border border-cms-border bg-white text-cms-muted"
    >
      Loading editor…
    </Typography>
  ),
});

export type ProjectFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  displayOrder: string;
  orderMode: DisplayOrderMode;
  projectBannerFile: File | null;
  projectBannerUrl: string | null;
  projectMobileBannerFile: File | null;
  projectMobileBannerUrl: string | null;
};

export const emptyProjectForm = (): ProjectFormValues => ({
  title: "",
  slug: "",
  shortDescription: "",
  content: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  displayOrder: "",
  orderMode: "move",
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
    shortDescription: project.shortDescription ?? "",
    content: project.content ?? "",
    status: project.status ?? "draft",
    metaTitle: project.metaTitle ?? "",
    metaDescription: project.metaDescription ?? "",
    schemaCode: project.schemaCode ?? "",
    displayOrder:
      project.displayOrder != null ? String(project.displayOrder) : "",
    orderMode: "move",
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
    shortDescription: form.shortDescription.trim() || undefined,
    content: plainContent ? form.content : undefined,
    displayOrder: Number.isFinite(order) && order > 0 ? order : undefined,
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
    // A cleared order keeps the current position.
    if (key === "displayOrder" && after === undefined) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const orderMode = orderModeForPatch(
    initial.displayOrder,
    current.displayOrder,
    current.orderMode
  );
  if (orderMode) fields.orderMode = orderMode;

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
  /** Loaded values on the edit page; enables the move/swap choice for order changes. */
  initial?: ProjectFormValues;
};

export default function ProjectForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  slugLocked,
  onSlugManualEdit,
  initial,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="space-y-4 rounded-xl border border-cms-border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <CmsDisplayOrderField
            value={value.displayOrder}
            onChange={(displayOrder) => onChange({ ...value, displayOrder })}
            mode={value.orderMode}
            onModeChange={(orderMode) => onChange({ ...value, orderMode })}
            initialOrder={initial?.displayOrder}
            itemLabel="project"
            listLabel="projects"
          />
        </div>

        <CmsFormField
          label="Desktop / web banner"
          htmlFor="projectBanner"
          hint={`WebP or AVIF · exact size ${PROJECT_BANNER_SIZE.width} × ${PROJECT_BANNER_SIZE.height}px (~2:1 landscape — homepage accordion; keep subject centered for collapsed strips)`}
        >
          <CmsImagePicker
            label="desktop banner"
            requiredSize={PROJECT_BANNER_SIZE}
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
          hint={`WebP or AVIF · exact size ${PROJECT_MOBILE_BANNER_SIZE.width} × ${PROJECT_MOBILE_BANNER_SIZE.height}px (portrait — mobile project stack)`}
        >
          <CmsImagePicker
            label="mobile banner"
            requiredSize={PROJECT_MOBILE_BANNER_SIZE}
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
        className="w-full sm:w-auto sm:min-w-32"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
