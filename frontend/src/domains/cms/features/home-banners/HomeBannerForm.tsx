"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  HomeBanner,
  HomeBannerFields,
  UpdateHomeBannerPayload,
} from "@/domains/cms/lib/types";
import CmsImagePicker from "@/domains/cms/ui/CmsImagePicker";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { ACTIVE_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";

export const HOME_BANNER_SIZE = { width: 1920, height: 750 } as const;
export const HOME_MOBILE_BANNER_SIZE = { width: 750, height: 800 } as const;
export const HOME_PROFILE_IMAGE_SIZE = { width: 400, height: 400 } as const;

export type HomeBannerFormValues = {
  name: string;
  title: string;
  location: string;
  shortDescription: string;
  bannerImageFile: File | null;
  bannerImageUrl: string | null;
  mobileBannerImageFile: File | null;
  mobileBannerImageUrl: string | null;
  profileImageFile: File | null;
  profileImageUrl: string | null;
  displayOrder: string;
  isActive: boolean;
};

export const emptyHomeBannerForm = (): HomeBannerFormValues => ({
  name: "",
  title: "",
  location: "",
  shortDescription: "",
  bannerImageFile: null,
  bannerImageUrl: null,
  mobileBannerImageFile: null,
  mobileBannerImageUrl: null,
  profileImageFile: null,
  profileImageUrl: null,
  displayOrder: "1",
  isActive: true,
});

export function homeBannerToFormValues(
  banner: HomeBanner
): HomeBannerFormValues {
  return {
    name: banner.name ?? "",
    title: banner.title ?? "",
    location: banner.location ?? "",
    shortDescription: banner.shortDescription ?? "",
    bannerImageFile: null,
    bannerImageUrl: banner.bannerImageUrl ?? null,
    mobileBannerImageFile: null,
    mobileBannerImageUrl: banner.mobileBannerImageUrl ?? null,
    profileImageFile: null,
    profileImageUrl: banner.profileImageUrl ?? null,
    displayOrder:
      banner.displayOrder != null ? String(banner.displayOrder) : "1",
    isActive: banner.isActive !== false,
  };
}

export function formValuesToFields(
  form: HomeBannerFormValues
): HomeBannerFields {
  const order = Number.parseInt(form.displayOrder.trim(), 10);
  return {
    name: form.name.trim(),
    title: form.title.trim(),
    location: form.location.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    displayOrder: Number.isFinite(order) && order > 0 ? order : 1,
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

  if (norm(prev.name) !== norm(next.name)) fields.name = next.name;
  if (norm(prev.title) !== norm(next.title)) fields.title = next.title;
  if (norm(prev.location) !== norm(next.location)) {
    fields.location = next.location ?? "";
  }
  if (norm(prev.shortDescription) !== norm(next.shortDescription)) {
    fields.shortDescription = next.shortDescription ?? "";
  }
  if (prev.displayOrder !== next.displayOrder) {
    fields.displayOrder = next.displayOrder;
  }
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
};

export default function HomeBannerForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  mode = "create",
}: HomeBannerFormProps) {
  const hasBannerImage = !!value.bannerImageFile || !!value.bannerImageUrl;

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Name" htmlFor="name" hint="Internal label">
            <Input
              id="name"
              required
              placeholder="Hero Banner 1"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </CmsFormField>

          <CmsFormField label="Title" htmlFor="title">
            <Input
              id="title"
              required
              placeholder="Welcome to HCG Foundation"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
            />
          </CmsFormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Location" htmlFor="location">
            <Input
              id="location"
              placeholder="Homepage Hero Section"
              value={value.location}
              onChange={(e) =>
                onChange({ ...value, location: e.target.value })
              }
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

        <CmsFormField label="Short description" htmlFor="shortDescription">
          <Textarea
            id="shortDescription"
            placeholder="Brief line shown with the banner"
            value={value.shortDescription}
            onChange={(e) =>
              onChange({ ...value, shortDescription: e.target.value })
            }
          />
        </CmsFormField>

        <CmsFormField
          label="Banner image"
          htmlFor="bannerImage"
          hint={`WebP or AVIF · recommended size ${HOME_BANNER_SIZE.width} × ${HOME_BANNER_SIZE.height}px (1920px desktop width banner)`}
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
          hint={`WebP or AVIF · recommended size ${HOME_MOBILE_BANNER_SIZE.width} × ${HOME_MOBILE_BANNER_SIZE.height}px (mobile banner)`}
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
          hint={`WebP or AVIF · recommended size ${HOME_PROFILE_IMAGE_SIZE.width} × ${HOME_PROFILE_IMAGE_SIZE.height}px (square profile avatar)`}
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
            requiredSize={HOME_PROFILE_IMAGE_SIZE}
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

      <Button
        type="submit"
        disabled={
          saving ||
          !value.name.trim() ||
          !value.title.trim() ||
          (mode === "create" && !value.bannerImageFile) ||
          (mode === "edit" && !hasBannerImage)
        }
        className="h-11 w-full bg-[#C45A7A] text-white hover:bg-[#b04e6c] sm:w-auto sm:min-w-[200px]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
