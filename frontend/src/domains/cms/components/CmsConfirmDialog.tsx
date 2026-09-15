"use client";

import { useEffect } from "react";
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
        className="absolute inset-0 bg-black/40"
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
        className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10 sm:p-6"
      >
        <h2
          id="cms-confirm-title"
          className="font-manrope text-lg font-semibold text-[#212121]"
        >
          {options.title}
        </h2>
        {options.description ? (
          <p
            id="cms-confirm-desc"
            className="mt-2 font-manrope text-sm leading-relaxed text-[#5C5C5C]"
          >
            {options.description}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-black/10 bg-white text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
            onClick={() => close(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={
              tone === "danger"
                ? "h-9 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                : "h-9 bg-[#FCCC2D] text-[#212121] hover:bg-[#f5c01f] hover:text-[#212121]"
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
