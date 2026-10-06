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

export type CmsImageRequiredSize = {
  width: number;
  height: number;
};

const ALLOWED_TYPES = new Set(["image/webp", "image/avif"]);
/** Resized images are re-encoded as WebP, so common source formats are fine too. */
const RESIZE_ALLOWED_TYPES = new Set([...ALLOWED_TYPES, "image/png", "image/jpeg"]);
const MAX_BYTES = 5 * 1024 * 1024;

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(size);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

/** Centre-crops to the target aspect ratio, scales to the exact size and re-encodes as WebP. */
async function resizeImage(file: File, size: CmsImageRequiredSize): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const targetRatio = size.width / size.height;
    let sw = bitmap.width;
    let sh = bitmap.height;
    if (sw / sh > targetRatio) sw = Math.round(sh * targetRatio);
    else sh = Math.round(sw / targetRatio);
    const sx = Math.round((bitmap.width - sw) / 2);
    const sy = Math.round((bitmap.height - sh) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, size.width, size.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.92)
    );
    if (!blob || blob.type !== "image/webp") {
      throw new Error("WebP encoding not supported");
    }
    const name = `${file.name.replace(/\.[^.]+$/, "")}.webp`;
    return new File([blob], name, { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

type CmsImagePickerProps = {
  value: CmsImageValue;
  onChange: (next: CmsImageValue) => void;
  label?: string;
  accept?: string;
  disabled?: boolean;
  /** When set, only images matching this exact pixel size are accepted. */
  requiredSize?: CmsImageRequiredSize;
  /** When set, any size is accepted and the image is cropped/resized to this size before upload. */
  resizeTo?: CmsImageRequiredSize;
};

export default function CmsImagePicker({
  value,
  onChange,
  label = "image",
  accept,
  disabled,
  requiredSize,
  resizeTo,
}: CmsImagePickerProps) {
  const resizing = !requiredSize && !!resizeTo;
  const acceptTypes =
    accept ??
    (resizing
      ? "image/webp,image/avif,image/png,image/jpeg,.webp,.avif,.png,.jpg,.jpeg"
      : "image/webp,image/avif,.webp,.avif");
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
  const targetSize = requiredSize ?? resizeTo;
  const sizeLabel = targetSize
    ? `${targetSize.width} × ${targetSize.height}px`
    : null;

  const openPicker = () => {
    if (disabled) return;
    fileRef.current?.click();
  };

  const clear = () => {
    onChange({ file: null, url: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyFile = async (file: File | null) => {
    if (!file) {
      onChange({ file: null, url: value.url });
      return;
    }
    if (!(resizing ? RESIZE_ALLOWED_TYPES : ALLOWED_TYPES).has(file.type)) {
      cmsToast.error(
        resizing
          ? "Only WebP, AVIF, PNG or JPEG images are allowed."
          : "Only WebP or AVIF images are allowed."
      );
      return;
    }
    if (file.size > MAX_BYTES) {
      cmsToast.error("Image must be 5MB or smaller.");
      return;
    }
    if (requiredSize) {
      try {
        const { width, height } = await readImageSize(file);
        if (
          width !== requiredSize.width ||
          height !== requiredSize.height
        ) {
          cmsToast.error(
            `Image must be exactly ${requiredSize.width} × ${requiredSize.height}px (got ${width} × ${height}px).`
          );
          return;
        }
      } catch {
        cmsToast.error("Could not verify image resolution. Try another file.");
        return;
      }
    } else if (resizing && resizeTo) {
      try {
        file = await resizeImage(file, resizeTo);
      } catch {
        cmsToast.error("Could not resize this image. Try another file or browser.");
        return;
      }
    }
    onChange({ file, url: null });
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={acceptTypes}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          void applyFile(file);
          e.target.value = "";
        }}
      />

      {sizeLabel ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-cms-border bg-cms-subtle px-2.5 py-1 text-xs">
          <span className="font-medium text-cms-muted">
            {requiredSize ? "Required size" : "Saved at"}
          </span>
          <span className="font-semibold text-cms-ink tabular-nums">
            {sizeLabel}
          </span>
        </div>
      ) : null}

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
          void applyFile(file);
        }}
        className={cn(
          "overflow-hidden rounded-lg border border-dashed border-cms-border-strong bg-cms-subtle/60 outline-none transition-colors",
          !disabled && "cursor-pointer hover:border-cms-primary/50 hover:bg-cms-subtle",
          !disabled &&
            "focus-visible:border-cms-primary/60 focus-visible:ring-3 focus-visible:ring-cms-primary/15",
          dragging && !disabled && "border-cms-primary bg-cms-primary-soft",
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
                  className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-md border border-cms-border bg-white text-cms-ink shadow-sm transition hover:bg-red-50"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              ) : null}
            </>
          ) : (
            <div className="pointer-events-none flex flex-col items-center gap-2 px-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-lg border border-cms-border bg-white">
                <ImagePlus className="size-5 text-cms-muted" />
              </div>
              <Typography
                variant="label-1"
                as="p"
                className="font-medium text-cms-ink"
              >
                Click or drop to upload {label}
              </Typography>
              <Typography
                variant="caption-1"
                as="p"
                className="max-w-[300px] text-cms-muted"
              >
                {requiredSize
                  ? `Attach a WebP or AVIF image at exactly ${sizeLabel} (max 5MB)`
                  : resizing
                    ? `Any size WebP, AVIF, PNG or JPEG (max 5MB) · resized to ${sizeLabel}`
                    : "Click or drop a WebP or AVIF image (max 5MB)"}
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="caption-1" as="p" className="min-w-0 truncate text-cms-muted">
          {value.file
            ? `${value.file.name} · ${(value.file.size / 1024).toFixed(0)} KB${sizeLabel ? ` · ${sizeLabel}` : ""}`
            : previewSrc
              ? "Current image"
              : "No file selected"}
        </Typography>
        <div className="flex items-center gap-2">
          {previewSrc ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={clear}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => openPicker()}
          >
            <Upload className="size-3.5" />
            {previewSrc ? "Replace" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
