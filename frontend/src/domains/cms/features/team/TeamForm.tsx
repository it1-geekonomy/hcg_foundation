"use client";

import dynamic from "next/dynamic";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  ContentStatus,
  Team,
  TeamFields,
  TeamType,
} from "@/domains/cms/lib/types";
import { TEAM_IMAGE_SIZE } from "@/domains/about/constants/teams";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, {
  CONTENT_STATUS_OPTIONS,
  TEAM_TYPE_OPTIONS,
} from "@/domains/cms/ui/CmsSelect";
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

export type TeamFormValues = {
  title: string;
  type: TeamType;
  designation: string;
  content: string;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
  teamImageFile: File | null;
  teamImageUrl: string | null;
};

export const emptyTeamForm = (): TeamFormValues => ({
  title: "",
  type: "team",
  designation: "",
  content: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
  teamImageFile: null,
  teamImageUrl: null,
});

export function teamToFormValues(team: Team): TeamFormValues {
  return {
    title: team.title ?? "",
    type: team.type ?? "team",
    designation: team.designation ?? "",
    content: team.content ?? "",
    status: team.status ?? "draft",
    metaTitle: team.metaTitle ?? "",
    metaDescription: team.metaDescription ?? "",
    schemaCode: team.schemaCode ?? "",
    teamImageFile: null,
    teamImageUrl: team.teamImage ?? null,
  };
}

export function formValuesToFields(form: TeamFormValues): TeamFields {
  const plainContent = form.content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    type: form.type,
    designation: form.designation.trim() || undefined,
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

/** Collapse TinyMCE / HTML noise so equivalent content isn't treated as dirty. */
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

function valuesEqual(key: keyof TeamFields, a?: string, b?: string) {
  if (key === "content") return normHtml(a) === normHtml(b);
  return norm(a) === norm(b);
}

/** Diff edit form vs loaded snapshot — only changed keys for PATCH. */
export function getTeamPatch(
  initial: TeamFormValues,
  current: TeamFormValues
): {
  fields: Partial<TeamFields>;
  file: File | null;
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<TeamFields> = {};

  const keys: (keyof TeamFields)[] = [
    "title",
    "type",
    "designation",
    "content",
    "status",
    "metaTitle",
    "metaDescription",
    "schemaCode",
  ];

  for (const key of keys) {
    const before = prev[key] as string | undefined;
    const after = next[key] as string | undefined;
    if (valuesEqual(key, before, after)) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const file = current.teamImageFile;
  return {
    fields,
    file,
    hasChanges: Object.keys(fields).length > 0 || !!file,
  };
}

type TeamFormProps = {
  value: TeamFormValues;
  onChange: (next: TeamFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function TeamForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: TeamFormProps) {
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
        <CmsFormField label="Title / Name" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Dr. John Smith"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Type" htmlFor="type">
          <CmsSelect
            id="type"
            value={value.type}
            options={TEAM_TYPE_OPTIONS}
            onChange={(type) =>
              onChange({
                ...value,
                type: type as TeamType,
              })
            }
          />
        </CmsFormField>

        <CmsFormField label="Designation" htmlFor="designation">
          <Input
            id="designation"
            placeholder="Senior Oncologist"
            value={value.designation}
            onChange={(e) =>
              onChange({ ...value, designation: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Team image"
          htmlFor="teamImage"
          hint={`WebP or AVIF · exact size ${TEAM_IMAGE_SIZE.width} × ${TEAM_IMAGE_SIZE.height}px (320:380 portrait — same crop on mobile & desktop; keep face near the top)`}
        >
          <CmsImagePicker
            label="team image"
            value={{ file: value.teamImageFile, url: value.teamImageUrl }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                teamImageFile: file,
                teamImageUrl: url,
              })
            }
            requiredSize={TEAM_IMAGE_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField label="Content" htmlFor="content">
          <CmsRichTextEditor
            id="content"
            value={value.content}
            onChange={(content) => onChange({ ...value, content })}
            placeholder="Full biography"
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
        disabled={saving || !value.title.trim()}
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
