"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cn } from "@/lib/utils";

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
  const [dragging, setDragging] = useState(false);

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

  const openPicker = () => {
    if (disabled) return;
    fileRef.current?.click();
  };

  const clear = () => {
    onChange({ file: null, url: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyFile = (file: File | null) => {
    if (!file) {
      onChange({ file: null, url: value.url });
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      cmsToast.error("Only WebP or AVIF images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      cmsToast.error("Image must be 5MB or smaller.");
      return;
    }
    onChange({ file, url: null });
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          applyFile(file);
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={
          previewSrc ? `Change ${label}` : `Upload ${label}`
        }
        onClick={() => openPicker()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          const file = e.dataTransfer.files?.[0] ?? null;
          applyFile(file);
        }}
        className={cn(
          "overflow-hidden rounded-xl border border-black/8 bg-[#F7F6F3] outline-none transition",
          !disabled && "cursor-pointer hover:border-[#C45A7A]/35 hover:bg-[#F3F1ED]",
          !disabled &&
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging && !disabled && "border-[#C45A7A]/50 bg-[#FFF6E8]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="relative flex h-52 items-center justify-center sm:h-56">
          {previewSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-contain p-3"
              />
              {!disabled ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clear();
                  }}
                  className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-[#212121] shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              ) : null}
            </>
          ) : (
            <div className="pointer-events-none flex flex-col items-center gap-2 px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
                <ImagePlus className="size-5 text-[#8A8A8A]" />
              </div>
              <Typography
                variant="label-1"
                as="p"
                className="font-medium text-[#3A3A3A]"
              >
                No {label} selected
              </Typography>
              <Typography
                variant="caption-1"
                as="p"
                className="max-w-[240px] text-[#7A7A7A]"
              >
                Click or drop a WebP or AVIF image (max 5MB)
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-9 gap-1.5"
          onClick={() => openPicker()}
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
        <Typography variant="caption-1" as="p" className="text-[#5C5C5C]">
          Selected file: {value.file.name} (
          {(value.file.size / 1024).toFixed(0)} KB)
        </Typography>
      ) : null}
    </div>
  );
}
