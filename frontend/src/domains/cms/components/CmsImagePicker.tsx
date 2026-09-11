"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cmsToast } from "@/domains/cms/lib/toast";

export type CmsImageValue = {
  file: File | null;
  url: string | null;
};

const ALLOWED_TYPES = new Set(["image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

type CmsImagePickerProps = {
  value: CmsImageValue;
  onChange: (next: CmsImageValue) => void;
  label?: string;
  accept?: string;
  disabled?: boolean;
};

export default function CmsImagePicker({
  value,
  onChange,
  label = "image",
  accept = "image/webp,image/avif,.webp,.avif",
  disabled,
}: CmsImagePickerProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const localPreview = useMemo(() => {
    if (!value.file) return null;
    return URL.createObjectURL(value.file);
  }, [value.file]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewSrc = localPreview || value.url;

  const clear = () => {
    onChange({ file: null, url: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-black/8 bg-[#F7F6F3]">
        <div className="relative flex h-52 items-center justify-center sm:h-56">
          {previewSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-3"
              />
              {!disabled ? (
                <button
                  type="button"
                  onClick={clear}
                  className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-[#212121] shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
                <ImagePlus className="size-5 text-[#8A8A8A]" />
              </div>
              <p className="font-manrope text-sm font-medium text-[#3A3A3A]">
                No {label} selected
              </p>
              <p className="max-w-[240px] font-manrope text-xs text-[#7A7A7A]">
                Upload a WebP or AVIF image (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) {
            onChange({ file: null, url: value.url });
            return;
          }
          if (!ALLOWED_TYPES.has(file.type)) {
            cmsToast.error("Only WebP or AVIF images are allowed.");
            e.target.value = "";
            return;
          }
          if (file.size > MAX_BYTES) {
            cmsToast.error("Image must be 5MB or smaller.");
            e.target.value = "";
            return;
          }
          onChange({ file, url: null });
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-9 gap-1.5"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Upload new
        </Button>
        {previewSrc ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-9 gap-1.5 text-destructive"
            onClick={clear}
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      {value.file ? (
        <p className="font-manrope text-xs text-[#5C5C5C]">
          Selected file: {value.file.name} (
          {(value.file.size / 1024).toFixed(0)} KB)
        </p>
      ) : null}
    </div>
  );
}
