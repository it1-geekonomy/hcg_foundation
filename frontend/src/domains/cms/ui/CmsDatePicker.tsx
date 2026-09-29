"use client";

import { useId, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsPopoverPositionClass, useCmsPopover } from "./useCmsPopover";

type CmsDatePickerProps = {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

type View = "days" | "months" | "years";
type Ymd = { y: number; m: number; d: number }; // m is 0-based

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseYmd(value?: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec((value ?? "").trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  if (m < 0 || m > 11 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function toValue({ y, m, d }: Ymd) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayYmd(): Ymd {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

function sameDay(a: Ymd | null, b: Ymd | null) {
  return !!a && !!b && a.y === b.y && a.m === b.m && a.d === b.d;
}

function formatDisplay(ymd: Ymd) {
  return `${pad(ymd.d)} ${MONTHS_SHORT[ymd.m]} ${ymd.y}`;
}

/** 42 cells (6 weeks) so the panel height never jumps between months. */
function monthGrid(y: number, m: number) {
  const firstWeekday = new Date(y, m, 1).getDay();
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(y, m, i - firstWeekday + 1);
    return {
      y: date.getFullYear(),
      m: date.getMonth(),
      d: date.getDate(),
      outside: date.getMonth() !== m,
    };
  });
}

const PANEL = { width: 296, height: 372 };

export default function CmsDatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  disabled,
  className,
}: CmsDatePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const { rootRef, open, setOpen, toggle, placement } = useCmsPopover(PANEL);

  const selected = parseYmd(value);
  const today = todayYmd();
  const minValue = parseYmd(min) ? min!.slice(0, 10) : null;
  const maxValue = parseYmd(max) ? max!.slice(0, 10) : null;

  const [view, setView] = useState<View>("days");
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => {
    const base = selected ?? today;
    return { y: base.y, m: base.m };
  });

  const isDisabledDay = (ymd: Ymd) => {
    const v = toValue(ymd);
    return (!!minValue && v < minValue) || (!!maxValue && v > maxValue);
  };

  const openPanel = () => {
    if (disabled) return;
    if (!open) {
      const base = selected ?? today;
      setCursor({ y: base.y, m: base.m });
      setView("days");
    }
    toggle();
  };

  const pick = (ymd: Ymd) => {
    if (isDisabledDay(ymd)) return;
    onChange(toValue(ymd));
    setOpen(false);
  };

  const step = (dir: -1 | 1) => {
    setCursor(({ y, m }) => {
      if (view === "years") return { y: y + dir * 12, m };
      if (view === "months") return { y: y + dir, m };
      const next = new Date(y, m + dir, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  };

  const yearPageStart = cursor.y - (cursor.y % 12);
  const title =
    view === "days"
      ? `${MONTHS_LONG[cursor.m]} ${cursor.y}`
      : view === "months"
        ? String(cursor.y)
        : `${yearPageStart} – ${yearPageStart + 11}`;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPanel}
        className={cn(
          "group flex h-9 w-full items-center gap-2 rounded-lg border border-cms-border bg-white pr-9 pl-3 text-left text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-[border-color,box-shadow]",
          "hover:border-cms-border-strong focus-visible:border-cms-primary/50 focus-visible:ring-3 focus-visible:ring-cms-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-cms-primary/50 ring-3 ring-cms-primary/15"
        )}
      >
        <CalendarDays
          className={cn(
            "size-4 shrink-0 transition-colors",
            open || selected ? "text-cms-primary" : "text-cms-faint"
          )}
        />
        <span
          className={cn(
            "truncate tabular-nums",
            selected ? "text-cms-ink" : "text-cms-muted"
          )}
        >
          {selected ? formatDisplay(selected) : placeholder}
        </span>
      </button>

      {selected && !disabled ? (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-cms-faint transition-colors hover:bg-cms-subtle hover:text-cms-ink"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-cms-faint" />
      )}

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date"
          style={{ width: PANEL.width }}
          className={cn(
            "absolute z-50 rounded-xl bg-white p-3 shadow-[0_16px_40px_-8px_rgba(16,24,40,0.18),0_4px_12px_-4px_rgba(16,24,40,0.08)] ring-1 ring-cms-border animate-in fade-in-0 zoom-in-95 duration-150",
            cmsPopoverPositionClass(placement)
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setView((v) => (v === "days" ? "months" : v === "months" ? "years" : "days"))
              }
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-cms-ink transition-colors hover:bg-cms-subtle"
            >
              {title}
              <ChevronDown
                className={cn(
                  "size-3.5 text-cms-muted transition-transform",
                  view !== "days" && "rotate-180"
                )}
              />
            </button>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => step(-1)}
                className="flex size-8 items-center justify-center rounded-lg text-cms-muted transition-colors hover:bg-cms-subtle hover:text-cms-ink"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => step(1)}
                className="flex size-8 items-center justify-center rounded-lg text-cms-muted transition-colors hover:bg-cms-subtle hover:text-cms-ink"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {view === "days" ? (
            <>
              <div className="grid grid-cols-7 pb-1">
                {WEEKDAYS.map((w) => (
                  <span
                    key={w}
                    className="flex h-8 items-center justify-center text-[11px] font-medium tracking-wide text-cms-faint uppercase"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {monthGrid(cursor.y, cursor.m).map((cell) => {
                  const isSelected = sameDay(cell, selected);
                  const isToday = sameDay(cell, today);
                  const isDisabled = isDisabledDay(cell);
                  return (
                    <button
                      key={toValue(cell)}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => pick(cell)}
                      aria-pressed={isSelected}
                      className={cn(
                        "relative mx-auto flex size-9 items-center justify-center rounded-lg text-[13px] tabular-nums transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-30",
                        isSelected
                          ? "bg-cms-primary font-semibold text-white shadow-[0_2px_6px_rgba(196,90,122,0.35)]"
                          : cell.outside
                            ? "text-cms-faint/70 hover:bg-cms-subtle"
                            : "text-cms-ink hover:bg-cms-primary-soft hover:text-cms-primary",
                        isToday && !isSelected && "font-semibold text-cms-primary"
                      )}
                    >
                      {cell.d}
                      {isToday && !isSelected ? (
                        <span className="absolute bottom-1 size-1 rounded-full bg-cms-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {view === "months" ? (
            <div className="grid h-[262px] grid-cols-3 content-center gap-2">
              {MONTHS_SHORT.map((label, m) => {
                const isSelected = selected?.y === cursor.y && selected.m === m;
                const isCurrent = today.y === cursor.y && today.m === m;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setCursor({ y: cursor.y, m });
                      setView("days");
                    }}
                    className={cn(
                      "h-12 rounded-lg text-[13px] font-medium transition-colors",
                      isSelected
                        ? "bg-cms-primary text-white"
                        : isCurrent
                          ? "bg-cms-primary-soft text-cms-primary"
                          : "text-cms-ink hover:bg-cms-subtle"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {view === "years" ? (
            <div className="grid h-[262px] grid-cols-3 content-center gap-2">
              {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => {
                const isSelected = selected?.y === y;
                const isCurrent = today.y === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCursor({ y, m: cursor.m });
                      setView("months");
                    }}
                    className={cn(
                      "h-12 rounded-lg text-[13px] font-medium tabular-nums transition-colors",
                      isSelected
                        ? "bg-cms-primary text-white"
                        : isCurrent
                          ? "bg-cms-primary-soft text-cms-primary"
                          : "text-cms-ink hover:bg-cms-subtle"
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-between border-t border-cms-border pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="h-8 rounded-lg px-2.5 text-[13px] font-medium text-cms-muted transition-colors hover:bg-cms-subtle hover:text-cms-ink"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isDisabledDay(today)}
              onClick={() => pick(today)}
              className="h-8 rounded-lg bg-cms-primary-soft px-3 text-[13px] font-semibold text-cms-primary transition-colors hover:bg-cms-primary hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
