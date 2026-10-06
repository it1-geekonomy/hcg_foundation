"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  Award,
  AwardFields,
  ContentStatus,
  DisplayOrderMode,
} from "@/domains/cms/lib/types";
import { AWARD_IMAGE_SIZE } from "@/domains/about/constants/awards";
import CmsDisplayOrderField, {
  orderModeForPatch,
} from "@/domains/cms/ui/CmsDisplayOrderField";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { CONTENT_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";

export type AwardFormValues = {
  title: string;
  year: string;
  description: string;
  displayOrder: string;
  orderMode: DisplayOrderMode;
  status: ContentStatus;
  awardImageFile: File | null;
  awardImageUrl: string | null;
};

export const emptyAwardForm = (): AwardFormValues => ({
  title: "",
  year: "",
  description: "",
  displayOrder: "",
  orderMode: "move",
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
      award.displayOrder != null ? String(award.displayOrder) : "",
    orderMode: "move",
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
  /** Loaded values on the edit page; enables the move/swap choice for order changes. */
  initial?: AwardFormValues;
};

export default function AwardForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  requireImage = false,
  initial,
}: AwardFormProps) {
  const hasImage = Boolean(value.awardImageFile || value.awardImageUrl);

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-4 rounded-xl border border-cms-border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CmsFormField label="Title" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Humanitarian Award 2024"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </CmsFormField>

        <div className="grid items-start gap-4 sm:grid-cols-2">
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

          <CmsDisplayOrderField
            value={value.displayOrder}
            onChange={(displayOrder) => onChange({ ...value, displayOrder })}
            mode={value.orderMode}
            onModeChange={(orderMode) => onChange({ ...value, orderMode })}
            initialOrder={initial?.displayOrder}
            itemLabel="award"
            listLabel="awards"
          />
        </div>

        <CmsFormField
          label="Award image"
          htmlFor="awardImage"
          hint={`WebP or AVIF · exact size ${AWARD_IMAGE_SIZE.width} × ${AWARD_IMAGE_SIZE.height}px (4:5 portrait — same crop on mobile & desktop)`}
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
            requiredSize={AWARD_IMAGE_SIZE}
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
        className="w-full sm:w-auto sm:min-w-32"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
