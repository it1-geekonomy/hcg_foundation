"use client";

import dynamic from "next/dynamic";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  ContentStatus,
  CreateTeamPayload,
  Team,
  TeamMemberType,
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

export type TeamFormValues = {
  title: string;
  designation: string;
  teamImage: string;
  shortDescription: string;
  content: string;
  memberType: TeamMemberType;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
};

export const emptyTeamForm = (): TeamFormValues => ({
  title: "",
  designation: "",
  teamImage: "",
  shortDescription: "",
  content: "",
  memberType: "trustee",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  schemaCode: "",
});

export function teamToFormValues(team: Team): TeamFormValues {
  return {
    title: team.title ?? "",
    designation: team.designation ?? "",
    teamImage: team.teamImage ?? "",
    shortDescription: team.shortDescription ?? "",
    content: team.content ?? "",
    memberType: team.memberType ?? "trustee",
    status: team.status ?? "draft",
    metaTitle: team.metaTitle ?? "",
    metaDescription: team.metaDescription ?? "",
    schemaCode: team.schemaCode ?? "",
  };
}

export function formValuesToPayload(form: TeamFormValues): CreateTeamPayload {
  const hasContent = form.content
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return {
    title: form.title.trim(),
    designation: form.designation.trim() || undefined,
    teamImage: form.teamImage.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    content: hasContent ? form.content : undefined,
    memberType: form.memberType,
    status: form.status,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    schemaCode: form.schemaCode.trim() || undefined,
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField
          label="Member type"
          htmlFor="memberType"
          hint="Same fields — choose trustee or team for the Our Team page sections"
        >
          <select
            id="memberType"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={value.memberType}
            onChange={(e) =>
              onChange({
                ...value,
                memberType: e.target.value as TeamMemberType,
              })
            }
          >
            <option value="trustee">Trustee</option>
            <option value="team">Team</option>
          </select>
        </CmsFormField>

        <CmsFormField label="Title / Name" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Dr. B.S. Ajaikumar"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Designation" htmlFor="designation">
          <Input
            id="designation"
            placeholder="Founder and Managing Trustee"
            value={value.designation}
            onChange={(e) =>
              onChange({ ...value, designation: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField label="Team Image URL" htmlFor="teamImage">
          <Input
            id="teamImage"
            placeholder="https://..."
            value={value.teamImage}
            onChange={(e) => onChange({ ...value, teamImage: e.target.value })}
          />
        </CmsFormField>

        <CmsFormField label="Short Description" htmlFor="shortDescription">
          <Textarea
            id="shortDescription"
            placeholder="Short blurb"
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
            placeholder="Full biography"
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
        disabled={saving || !value.title.trim()}
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
