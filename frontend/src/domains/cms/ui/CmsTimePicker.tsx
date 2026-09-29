"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsPopoverPositionClass, useCmsPopover } from "./useCmsPopover";

type CmsTimePickerProps = {
  id?: string;
  value: string; // HH:MM (24h)
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

type Period = "AM" | "PM";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseTime(value: string): { hour24: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  const hour24 = Number(m[1]);
  const minute = Number(m[2]);
  if (
    Number.isNaN(hour24) ||
    Number.isNaN(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour24, minute };
}

function to12h(hour24: number): { hour12: number; period: Period } {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

function to24h(hour12: number, period: Period) {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

type TimeSegmentProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
};

/** Editable 2-digit segment: type any value, or use ↑/↓ to step (wraps). */
function TimeSegment({ label, value, min, max, onCommit }: TimeSegmentProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const wrap = (n: number) => {
    const span = max - min + 1;
    return ((((n - min) % span) + span) % span) + min;
  };

  const commitDraft = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (draft !== "" && !Number.isNaN(n) && n >= min && n <= max) onCommit(n);
    setDraft(null);
  };

  return (
    <input
      aria-label={label}
      inputMode="numeric"
      maxLength={2}
      value={draft ?? pad(value)}
      onFocus={(e) => {
        setDraft(pad(value));
        e.target.select();
      }}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
      onBlur={commitDraft}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitDraft();
          e.currentTarget.blur();
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = wrap(value + (e.key === "ArrowUp" ? 1 : -1));
          onCommit(next);
          setDraft(pad(next));
        }
      }}
      className="w-[2.6ch] rounded-md bg-transparent text-center text-2xl font-semibold tracking-tight text-cms-ink tabular-nums outline-none transition-colors hover:bg-white focus:bg-white focus:ring-2 focus:ring-cms-primary/30"
    />
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PANEL = { width: 296, height: 330 };

export default function CmsTimePicker({
  id,
  value,
  onChange,
  disabled,
  className,
}: CmsTimePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const { rootRef, open, setOpen, toggle, placement } = useCmsPopover(PANEL);

  const parsed = parseTime(value);
  const hour24 = parsed?.hour24 ?? 9;
  const minute = parsed?.minute ?? 0;
  const { hour12, period } = to12h(hour24);

  const commit = (nextHour12: number, nextMinute: number, nextPeriod: Period) => {
    onChange(`${pad(to24h(nextHour12, nextPeriod))}:${pad(nextMinute)}`);
  };

  const chip = (active: boolean) =>
    cn(
      "flex h-8 items-center justify-center rounded-lg text-[13px] tabular-nums transition-colors",
      active
        ? "bg-cms-primary font-semibold text-white shadow-[0_2px_6px_rgba(196,90,122,0.35)]"
        : "text-cms-ink hover:bg-cms-primary-soft hover:text-cms-primary"
    );

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (!parsed) commit(9, 0, "AM");
          toggle();
        }}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-cms-border bg-white pr-9 pl-3 text-left text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-[border-color,box-shadow]",
          "hover:border-cms-border-strong focus-visible:border-cms-primary/50 focus-visible:ring-3 focus-visible:ring-cms-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-cms-primary/50 ring-3 ring-cms-primary/15"
        )}
      >
        <Clock
          className={cn(
            "size-4 shrink-0 transition-colors",
            open || parsed ? "text-cms-primary" : "text-cms-faint"
          )}
        />
        <span
          className={cn(
            "truncate tabular-nums",
            parsed ? "text-cms-ink" : "text-cms-muted"
          )}
        >
          {parsed ? `${pad(hour12)}:${pad(minute)} ${period}` : "Select time"}
        </span>
      </button>

      {parsed && !disabled ? (
        <button
          type="button"
          aria-label="Clear time"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
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
          aria-label="Choose time"
          style={{ width: PANEL.width }}
          className={cn(
            "absolute z-50 rounded-xl bg-white p-3 shadow-[0_16px_40px_-8px_rgba(16,24,40,0.18),0_4px_12px_-4px_rgba(16,24,40,0.08)] ring-1 ring-cms-border animate-in fade-in-0 zoom-in-95 duration-150",
            cmsPopoverPositionClass(placement)
          )}
        >
          <div className="flex items-center justify-between rounded-lg bg-cms-subtle px-3 py-2.5">
            <div className="flex items-center">
              <TimeSegment
                label="Hour"
                value={hour12}
                min={1}
                max={12}
                onCommit={(h) => commit(h, minute, period)}
              />
              <span className="text-2xl font-semibold text-cms-faint">:</span>
              <TimeSegment
                label="Minute"
                value={minute}
                min={0}
                max={59}
                onCommit={(m) => commit(hour12, m, period)}
              />
            </div>
            <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-cms-border">
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={p === period}
                  onClick={() => commit(hour12, minute, p)}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-xs font-semibold transition-colors",
                    p === period
                      ? "bg-cms-primary text-white"
                      : "text-cms-muted hover:text-cms-ink"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 mb-1.5 px-0.5 text-[11px] font-medium tracking-wide text-cms-faint uppercase">
            Hour
          </p>
          <div className="grid grid-cols-6 gap-1">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={h === hour12}
                onClick={() => commit(h, minute, period)}
                className={chip(h === hour12)}
              >
                {pad(h)}
              </button>
            ))}
          </div>

          <div className="mt-3 mb-1.5 flex items-baseline justify-between px-0.5">
            <p className="text-[11px] font-medium tracking-wide text-cms-faint uppercase">
              Minute
            </p>
            <p className="text-[11px] text-cms-faint">
              Other minute? Type it above
            </p>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={m === minute}
                onClick={() => commit(hour12, m, period)}
                className={chip(m === minute)}
              >
                {pad(m)}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-cms-border pt-3">
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
              onClick={() => setOpen(false)}
              className="h-8 rounded-lg bg-cms-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-cms-primary-hover"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
