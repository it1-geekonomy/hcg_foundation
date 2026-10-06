"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Typography from "@/lib/Typography";
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
  /** Kept for API compatibility; all CMS controls share one height. */
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
    <div ref={rootRef} className={cn("relative w-full", className)}>
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
          "flex w-full items-center justify-between gap-2 rounded-lg border border-cms-border bg-white px-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-[border-color,box-shadow]",
          "hover:border-cms-border-strong focus-visible:border-cms-primary/60 focus-visible:ring-3 focus-visible:ring-cms-primary/15",
          "disabled:cursor-not-allowed disabled:bg-cms-subtle disabled:opacity-60",
          open && "border-cms-primary/60 ring-3 ring-cms-primary/15",
          "h-9"
        )}
      >
        <Typography
          variant="label-1"
          as="span"
          className={cn(
            "truncate",
            selected ? "text-cms-ink" : "text-cms-faint"
          )}
        >
          {selected?.label ?? placeholder}
        </Typography>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-cms-faint transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-cms-border bg-white p-1 shadow-[0_12px_28px_rgba(16,24,40,0.12)]"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors",
                    isActive
                      ? "bg-cms-subtle font-medium text-cms-ink"
                      : "text-cms-body hover:bg-cms-subtle"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Typography variant="label-1" as="span">
                    {option.label}
                  </Typography>
                  {isActive ? (
                    <Check className="size-4 shrink-0 text-cms-primary" />
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

export const TEAM_TYPE_OPTIONS: CmsSelectOption[] = [
  { value: "team", label: "Team" },
  { value: "trustee", label: "Trustee" },
];

export const DISPLAY_ORDER_MODE_OPTIONS: CmsSelectOption[] = [
  { value: "move", label: "Move here (shift others)" },
  { value: "swap", label: "Swap with current holder" },
];

export const TEAM_TYPE_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All types" },
  ...TEAM_TYPE_OPTIONS,
];

export const DONATION_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const CAMPAIGN_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export const CAMPAIGN_STATUS_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All statuses" },
  ...CAMPAIGN_STATUS_OPTIONS,
];

export const INQUIRY_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In review" },
  { value: "contacted", label: "Contacted" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export const INQUIRY_STATUS_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All statuses" },
  ...INQUIRY_STATUS_OPTIONS,
];

export const ACTIVE_STATUS_OPTIONS: CmsSelectOption[] = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const ACTIVE_STATUS_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All banners" },
  ...ACTIVE_STATUS_OPTIONS,
];
