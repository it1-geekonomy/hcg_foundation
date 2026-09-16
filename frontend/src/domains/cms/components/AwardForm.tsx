"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { Award, AwardFields, ContentStatus } from "@/domains/cms/lib/types";
import CmsImagePicker from "./CmsImagePicker";
import { CmsFormField } from "./CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "./CmsSelect";

export type AwardFormValues = {
  title: string;
  year: string;
  description: string;
  displayOrder: string;
  status: ContentStatus;
  awardImageFile: File | null;
  awardImageUrl: string | null;
};

export const emptyAwardForm = (): AwardFormValues => ({
  title: "",
  year: "",
  description: "",
  displayOrder: "1",
  status: "draft",
  awardImageFile: null,
  awardImageUrl: null,
});

export function awardToFormValues(award: Award): AwardFormValues {
  return {
    title: award.title ?? "",
    year: award.year != null ? String(award.year) : "",
    description: award.description ?? "",
    displayOrder:
      award.displayOrder != null ? String(award.displayOrder) : "1",
    status: award.status ?? "draft",
    awardImageFile: null,
    awardImageUrl: award.awardImageUrl ?? null,
  };
}

export function formValuesToFields(form: AwardFormValues): AwardFields {
  return {
    title: form.title.trim(),
    year: form.year.trim() || undefined,
    description: form.description.trim() || undefined,
    displayOrder: form.displayOrder.trim() || undefined,
    status: form.status,
  };
}

function norm(value?: string | null) {
  return (value ?? "").trim();
}

export function getAwardPatch(
  initial: AwardFormValues,
  current: AwardFormValues
): {
  fields: Partial<AwardFields>;
  file: File | null;
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: Partial<AwardFields> = {};
  const keys: (keyof AwardFields)[] = [
    "title",
    "year",
    "description",
    "displayOrder",
    "status",
  ];

  for (const key of keys) {
    const before = prev[key];
    const after = next[key];
    if (norm(before) === norm(after)) continue;
    fields[key] = (after === undefined ? "" : after) as never;
  }

  const file = current.awardImageFile;
  return {
    fields,
    file,
    hasChanges: Object.keys(fields).length > 0 || !!file,
  };
}

type AwardFormProps = {
  value: AwardFormValues;
  onChange: (next: AwardFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  requireImage?: boolean;
};

export default function AwardForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  requireImage = false,
}: AwardFormProps) {
  const hasImage = Boolean(value.awardImageFile || value.awardImageUrl);

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Humanitarian Award 2024"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </CmsFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Year" htmlFor="year">
            <Input
              id="year"
              type="number"
              inputMode="numeric"
              placeholder="2024"
              value={value.year}
              onChange={(e) => onChange({ ...value, year: e.target.value })}
            />
          </CmsFormField>

          <CmsFormField label="Display order" htmlFor="displayOrder">
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
          label="Award image"
          htmlFor="awardImage"
          hint="WebP or AVIF, required to create"
        >
          <CmsImagePicker
            label="award image"
            value={{ file: value.awardImageFile, url: value.awardImageUrl }}
            onChange={({ file, url }) =>
              onChange({
                ...value,
                awardImageFile: file,
                awardImageUrl: url,
              })
            }
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            placeholder="Short description of the award"
            value={value.description}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
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

      <Button
        type="submit"
        disabled={
          saving || !value.title.trim() || (requireImage && !hasImage)
        }
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
