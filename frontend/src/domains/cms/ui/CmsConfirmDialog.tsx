"use client";

import { useEffect } from "react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { useCmsConfirmStore } from "@/domains/cms/lib/confirm";

export default function CmsConfirmDialog() {
  const open = useCmsConfirmStore((s) => s.open);
  const options = useCmsConfirmStore((s) => s.options);
  const close = useCmsConfirmStore((s) => s.close);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !options) return null;

  const tone = options.tone ?? "default";
  const confirmLabel = options.confirmLabel ?? "Confirm";
  const cancelLabel = options.cancelLabel ?? "Cancel";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f1115]/50 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={() => close(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cms-confirm-title"
        aria-describedby={
          options.description ? "cms-confirm-desc" : undefined
        }
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_24px_48px_rgba(16,24,40,0.18)] ring-1 ring-cms-border"
      >
        <div className="p-6">
          <Typography
            variant="body-9"
            as="h2"
            id="cms-confirm-title"
            className="font-semibold text-cms-ink"
          >
            {options.title}
          </Typography>
          {options.description ? (
            <Typography
              variant="label-1"
              as="p"
              id="cms-confirm-desc"
              className="mt-2 text-cms-muted"
            >
              {options.description}
            </Typography>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-cms-border bg-cms-subtle/60 px-6 py-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => close(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={
              tone === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : undefined
            }
            onClick={() => close(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
