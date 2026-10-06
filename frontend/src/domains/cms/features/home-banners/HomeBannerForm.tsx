"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  DisplayOrderMode,
  HomeBanner,
  HomeBannerFields,
  UpdateHomeBannerPayload,
} from "@/domains/cms/lib/types";
import CmsDisplayOrderField, {
  orderModeForPatch,
} from "@/domains/cms/ui/CmsDisplayOrderField";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { ACTIVE_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";

export const HOME_BANNER_SIZE = { width: 1920, height: 750 } as const;
export const HOME_MOBILE_BANNER_SIZE = { width: 750, height: 800 } as const;
/** Matches the existing hero thumbnails (public/home/dr*.png); shown at up to 96px. */
export const HOME_PROFILE_IMAGE_SIZE = { width: 119, height: 119 } as const;

export type HomeBannerFormValues = {
  name: string;
  title: string;
  shortDescription: string;
  bannerImageFile: File | null;
  bannerImageUrl: string | null;
  mobileBannerImageFile: File | null;
  mobileBannerImageUrl: string | null;
  profileImageFile: File | null;
  profileImageUrl: string | null;
  displayOrder: string;
  orderMode: DisplayOrderMode;
  isActive: boolean;
};

export const emptyHomeBannerForm = (): HomeBannerFormValues => ({
  name: "",
  title: "",
  shortDescription: "",
  bannerImageFile: null,
  bannerImageUrl: null,
  mobileBannerImageFile: null,
  mobileBannerImageUrl: null,
  profileImageFile: null,
  profileImageUrl: null,
  displayOrder: "",
  orderMode: "move",
  isActive: true,
});

export function homeBannerToFormValues(
  banner: HomeBanner
): HomeBannerFormValues {
  return {
    name: banner.name ?? "",
    title: banner.title ?? "",
    shortDescription: banner.shortDescription ?? "",
    bannerImageFile: null,
    bannerImageUrl: banner.bannerImageUrl ?? null,
    mobileBannerImageFile: null,
    mobileBannerImageUrl: banner.mobileBannerImageUrl ?? null,
    profileImageFile: null,
    profileImageUrl: banner.profileImageUrl ?? null,
    displayOrder:
      banner.displayOrder != null ? String(banner.displayOrder) : "",
    orderMode: "move",
    isActive: banner.isActive !== false,
  };
}

export function formValuesToFields(
  form: HomeBannerFormValues
): HomeBannerFields {
  const order = Number.parseInt(form.displayOrder.trim(), 10);
  return {
    name: form.name.trim() || undefined,
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim() || undefined,
    displayOrder: Number.isFinite(order) && order > 0 ? order : undefined,
    isActive: form.isActive,
  };
}

function norm(value?: string | null) {
  return (value ?? "").trim();
}

export function getHomeBannerPatch(
  initial: HomeBannerFormValues,
  current: HomeBannerFormValues
): {
  fields: UpdateHomeBannerPayload;
  files: {
    bannerImage: File | null;
    mobileBannerImage: File | null;
    profileImage: File | null;
  };
  hasChanges: boolean;
} {
  const prev = formValuesToFields(initial);
  const next = formValuesToFields(current);
  const fields: UpdateHomeBannerPayload = {};

  if (norm(prev.name) !== norm(next.name)) fields.name = next.name ?? "";
  if (norm(prev.title) !== norm(next.title)) fields.title = next.title;
  if (norm(prev.shortDescription) !== norm(next.shortDescription)) {
    fields.shortDescription = next.shortDescription ?? "";
  }
  // A cleared order keeps the current position.
  if (next.displayOrder !== undefined && prev.displayOrder !== next.displayOrder) {
    fields.displayOrder = next.displayOrder;
  }
  const orderMode = orderModeForPatch(
    initial.displayOrder,
    current.displayOrder,
    current.orderMode
  );
  if (orderMode) fields.orderMode = orderMode;
  if (prev.isActive !== next.isActive) fields.isActive = next.isActive;

  const files = {
    bannerImage: current.bannerImageFile,
    mobileBannerImage: current.mobileBannerImageFile,
    profileImage: current.profileImageFile,
  };

  return {
    fields,
    files,
    hasChanges:
      Object.keys(fields).length > 0 ||
      !!files.bannerImage ||
      !!files.mobileBannerImage ||
      !!files.profileImage,
  };
}

type HomeBannerFormProps = {
  value: HomeBannerFormValues;
  onChange: (next: HomeBannerFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  mode?: "create" | "edit";
  /** Loaded values on the edit page; enables the move/swap choice for order changes. */
  initial?: HomeBannerFormValues;
};

export default function HomeBannerForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  mode = "create",
  initial,
}: HomeBannerFormProps) {
  const hasBannerImage = !!value.bannerImageFile || !!value.bannerImageUrl;

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="space-y-4 rounded-xl border border-cms-border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <CmsFormField
            label="Name"
            htmlFor="name"
            hint="Shown as the heading on the homepage banner."
          >
            <Input
              id="name"
              placeholder="Ananya Nair"
              maxLength={255}
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </CmsFormField>

          <CmsFormField
            label="Title"
            htmlFor="title"
            hint="Tagline shown under the name."
          >
            <Input
              id="title"
              required
              placeholder="With courage in her heart and hope ahead."
              maxLength={255}
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
            />
          </CmsFormField>

          <CmsDisplayOrderField
            value={value.displayOrder}
            onChange={(displayOrder) => onChange({ ...value, displayOrder })}
            mode={value.orderMode}
            onModeChange={(orderMode) => onChange({ ...value, orderMode })}
            initialOrder={initial?.displayOrder}
            itemLabel="banner"
            listLabel="banners"
          />
        </div>

        <CmsFormField
          label="Description"
          htmlFor="shortDescription"
          hint="Line breaks are kept as typed."
        >
          <Textarea
            id="shortDescription"
            rows={5}
            placeholder="Text shown under the title on the banner"
            value={value.shortDescription}
            onChange={(e) =>
              onChange({ ...value, shortDescription: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Banner image"
          htmlFor="bannerImage"
          hint={`WebP or AVIF · exactly ${HOME_BANNER_SIZE.width} × ${HOME_BANNER_SIZE.height}px`}
        >
          <CmsImagePicker
            label="banner image"
            value={{
              file: value.bannerImageFile,
              url: value.bannerImageUrl,
            }}
            onChange={(next) =>
              onChange({
                ...value,
                bannerImageFile: next.file,
                bannerImageUrl: next.url,
              })
            }
            requiredSize={HOME_BANNER_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Mobile banner"
          htmlFor="mobileBannerImage"
          hint={`WebP or AVIF · exactly ${HOME_MOBILE_BANNER_SIZE.width} × ${HOME_MOBILE_BANNER_SIZE.height}px`}
        >
          <CmsImagePicker
            label="mobile banner"
            value={{
              file: value.mobileBannerImageFile,
              url: value.mobileBannerImageUrl,
            }}
            onChange={(next) =>
              onChange({
                ...value,
                mobileBannerImageFile: next.file,
                mobileBannerImageUrl: next.url,
              })
            }
            requiredSize={HOME_MOBILE_BANNER_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField
          label="Profile image"
          htmlFor="profileImage"
          hint={`Any size · automatically centre-cropped and resized to ${HOME_PROFILE_IMAGE_SIZE.width} × ${HOME_PROFILE_IMAGE_SIZE.height}px`}
        >
          <CmsImagePicker
            label="profile image"
            value={{
              file: value.profileImageFile,
              url: value.profileImageUrl,
            }}
            onChange={(next) =>
              onChange({
                ...value,
                profileImageFile: next.file,
                profileImageUrl: next.url,
              })
            }
            resizeTo={HOME_PROFILE_IMAGE_SIZE}
            disabled={saving}
          />
        </CmsFormField>

        <CmsFormField label="Visibility" htmlFor="isActive">
          <CmsSelect
            id="isActive"
            value={value.isActive ? "true" : "false"}
            options={ACTIVE_STATUS_OPTIONS}
            onChange={(next) =>
              onChange({ ...value, isActive: next === "true" })
            }
          />
        </CmsFormField>
      </div>

      <div className="flex justify-center pb-4">
        <Button
          type="submit"
          disabled={
            saving ||
            !value.title.trim() ||
            (mode === "create" && !value.bannerImageFile) ||
            (mode === "edit" && !hasBannerImage)
          }
          className="w-full sm:w-auto sm:min-w-32"
        >
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
