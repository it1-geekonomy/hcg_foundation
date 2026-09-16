"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type CmsSelectOption = {
  value: string;
  label: string;
};

type CmsSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CmsSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export default function CmsSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  size = "md",
}: CmsSelectProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-white text-left font-manrope outline-none transition",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-[#C45A7A]/40 ring-3 ring-[#C45A7A]/15",
          size === "sm" ? "h-8 px-2.5 text-sm" : "h-9 px-2.5 text-sm"
        )}
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-[#212121]" : "text-muted-foreground"
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-[#8A8A8A] transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-50 max-h-56 w-full overflow-y-auto rounded-xl bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-manrope text-sm transition",
                    isActive
                      ? "bg-[#FFF6E8] font-medium text-[#212121]"
                      : "text-[#3A3A3A] hover:bg-[#F7F7F5]"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isActive ? (
                    <Check className="size-3.5 shrink-0 text-[#C45A7A]" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export const CONTENT_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export const CONTENT_STATUS_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All statuses" },
  ...CONTENT_STATUS_OPTIONS,
];

export const DONATION_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];
