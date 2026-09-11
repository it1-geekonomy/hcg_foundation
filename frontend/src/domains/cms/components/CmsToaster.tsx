"use client";

import { X } from "lucide-react";
import { useCmsToastStore } from "@/domains/cms/lib/toast";

const toneClass: Record<string, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-amber-200 bg-amber-50 text-amber-950",
};

export default function CmsToaster() {
  const items = useCmsToastStore((s) => s.items);
  const dismiss = useCmsToastStore((s) => s.dismiss);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(100%-2rem,380px)] flex-col gap-2"
      aria-live="polite"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${toneClass[toast.tone] ?? toneClass.info}`}
          role="status"
        >
          <p className="min-w-0 flex-1 font-manrope text-sm leading-snug">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
