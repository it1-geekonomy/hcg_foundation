"use client";

import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  CmsEvent,
  ContentStatus,
  EventFields,
} from "@/domains/cms/lib/types";
import CmsImagePicker from "./CmsImagePicker";
import { CmsFormField } from "./CmsFormField";
import CmsLocationInput from "./CmsLocationInput";
import CmsTimePicker from "./CmsTimePicker";
import { SeoFieldsSection } from "./SeoFieldsSection";

const CmsRichTextEditor = dynamic(() => import("./CmsRichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-lg border border-input bg-white font-manrope text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export type EventFormValues = {
  title: string;
  slug: string;
  eventDate: string;
  eventLocation: string;
  eventTime: string;
  shortDescription: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  eventBannerFile: File | null;
  eventBannerUrl: string | null;
  eventMobileBannerFile: File | null;
  eventMobileBannerUrl: string | null;
};

export const emptyEventForm = (): EventFormValues => ({
  title: "",
  slug: "",
  eventDate: "",
  eventLocation: "",
  eventTime: "",
  shortDescription: "",
  content: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  eventBannerFile: null,
  eventBannerUrl: null,
  eventMobileBannerFile: null,
  eventMobileBannerUrl: null,
});

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

function toTimeInput(value?: string | null) {
  if (!value) return "";
  // API may return HH:MM:SS
  return value.slice(0, 5);
}

export function eventToFormValues(event: CmsEvent): EventFormValues {
  return {
    title: event.title ?? "",
    slug: event.slug ?? "",
    eventDate: event.eventDate ?? "",
    eventLocation: event.eventLocation ?? "",
    eventTime: toTimeInput(event.eventTime),
    shortDescription: event.shortDescription ?? "",
    content: event.content ?? "",
    status: event.status ?? "draft",
    metaTitle: event.metaTitle ?? "",
    metaDescription: event.metaDescription ?? "",
    schemaCode: event.schemaCode ?? "",
    eventBannerFile: null,
    eventBannerUrl: event.eventBanner ?? null,
    eventMobileBannerFile: null,
    eventMobileBannerUrl: event.eventMobileBanner ?? null,
  };
}

export function formValuesToFields(form: EventFormValues): EventFields {
  const plainContent = form.content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyTitle(form.title),
    eventDate: form.eventDate.trim() || undefined,
    eventLocation: form.eventLocation.trim() || undefined,
    eventTime: form.eventTime.trim() || undefined,
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

export function getEventPatch(
  initial: EventFormValues,
  current: EventFormValues
): {
  fields: Partial<EventFields>;
  files: {
    eventBanner: File | null;
    eventMobileBanner: File | null;
  };
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<EventFields> = {};
  const keys: (keyof EventFields)[] = [
    "title",
    "slug",
    "eventDate",
    "eventLocation",
    "eventTime",
    "shortDescription",
    "content",
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
        ? normHtml(before) === normHtml(after)
        : norm(before) === norm(after);
    if (equal) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const files = {
    eventBanner: current.eventBannerFile,
    eventMobileBanner: current.eventMobileBannerFile,
  };

  return {
    fields,
    files,
    hasChanges:
      Object.keys(fields).length > 0 ||
      !!files.eventBanner ||
      !!files.eventMobileBanner,
  };
}

type EventFormProps = {
  value: EventFormValues;
  onChange: (next: EventFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  slugLocked?: boolean;
  onSlugManualEdit?: () => void;
};

export default function EventForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  slugLocked,
  onSlugManualEdit,
}: EventFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Pink Hope Awareness Walk"
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

        <div className="grid gap-4 sm:grid-cols-3">
          <CmsFormField label="Date" htmlFor="eventDate">
            <Input
              id="eventDate"
              type="date"
              value={value.eventDate}
              onChange={(e) =>
                onChange({ ...value, eventDate: e.target.value })
              }
            />
          </CmsFormField>
          <CmsFormField label="Time" htmlFor="eventTime">
            <CmsTimePicker
              id="eventTime"
              value={value.eventTime}
              disabled={saving}
              onChange={(eventTime) => onChange({ ...value, eventTime })}
            />
          </CmsFormField>
          <CmsFormField label="Location" htmlFor="eventLocation">
            <CmsLocationInput
              id="eventLocation"
              value={value.eventLocation}
              disabled={saving}
              placeholder="Search Indian location…"
              onChange={(eventLocation) =>
                onChange({ ...value, eventLocation })
              }
            />
          </CmsFormField>
        </div>

        <CmsFormField
          label="Desktop / web banner"
          htmlFor="eventBanner"
          hint="WebP or AVIF"
        >
          <CmsImagePicker
            label="desktop banner"
            value={{
              file: value.eventBannerFile,
              url: value.eventBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                eventBannerFile: file,
                eventBannerUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Mobile banner"
          htmlFor="eventMobileBanner"
          hint="WebP or AVIF"
        >
          <CmsImagePicker
            label="mobile banner"
            value={{
              file: value.eventMobileBannerFile,
              url: value.eventMobileBannerUrl,
            }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                eventMobileBannerFile: file,
                eventMobileBannerUrl: url,
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
            placeholder="Full event details…"
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
