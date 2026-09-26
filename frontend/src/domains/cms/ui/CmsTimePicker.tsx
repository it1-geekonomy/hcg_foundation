"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Clock } from "lucide-react";
import Typography from "@/lib/Typography";
import { cn } from "@/lib/utils";

type CmsTimePickerProps = {
  id?: string;
  value: string; // HH:MM (24h)
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

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

function to12h(hour24: number) {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

function to24h(hour12: number, period: "AM" | "PM") {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function formatDisplay(value: string) {
  const parsed = parseTime(value);
  if (!parsed) return "";
  const { hour12, period } = to12h(parsed.hour24);
  return `${pad(hour12)}:${pad(parsed.minute)} ${period}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function CmsTimePicker({
  id,
  value,
  onChange,
  disabled,
  className,
}: CmsTimePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseTime(value);
  const hour24 = parsed?.hour24 ?? 9;
  const minute = parsed?.minute ?? 0;
  const { hour12, period } = to12h(hour24);

  const commit = (nextHour12: number, nextMinute: number, nextPeriod: "AM" | "PM") => {
    onChange(`${pad(to24h(nextHour12, nextPeriod))}:${pad(nextMinute)}`);
  };

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

  const periodValue = period as "AM" | "PM";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (!parsed) commit(9, 0, "AM");
          setOpen((v) => !v);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-white px-2.5 text-left outline-none transition",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-[#C45A7A]/40 ring-3 ring-[#C45A7A]/15"
        )}
      >
        <Typography
          variant="label-1"
          as="span"
          className={cn(
            "tabular-nums",
            parsed ? "text-[#212121]" : "text-muted-foreground"
          )}
        >
          {parsed ? formatDisplay(value) : "Select time"}
        </Typography>
        <Clock className="size-3.5 shrink-0 text-[#8A8A8A]" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Select time"
          className="absolute top-[calc(100%+6px)] left-0 z-50 w-[min(100%,280px)] overflow-hidden rounded-xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
        >
          <div className="grid grid-cols-3 border-b border-black/[0.06] bg-[#FAFAF8] px-3 py-2">
            <Typography
              variant="caption-1"
              as="p"
              className="text-center font-semibold tracking-[0.14em] text-[#9A9A9A] uppercase"
            >
              Hour
            </Typography>
            <Typography
              variant="caption-1"
              as="p"
              className="text-center font-semibold tracking-[0.14em] text-[#9A9A9A] uppercase"
            >
              Min
            </Typography>
            <Typography
              variant="caption-1"
              as="p"
              className="text-center font-semibold tracking-[0.14em] text-[#9A9A9A] uppercase"
            >
              —
            </Typography>
          </div>
          <div className="grid grid-cols-3 gap-0">
            <div className="max-h-48 overflow-y-auto border-r border-black/[0.04]">
              <ul className="py-1">
                {HOURS.map((h) => (
                  <li key={`h-${h}`}>
                    <button
                      type="button"
                      onClick={() => commit(h, minute, periodValue)}
                      className={cn(
                        "flex w-full items-center justify-center px-2 py-1.5 transition",
                        h === hour12
                          ? "bg-[#C45A7A] font-semibold text-white"
                          : "text-[#212121] hover:bg-[#F7F7F5]"
                      )}
                    >
                      <Typography
                        variant="label-1"
                        as="span"
                        className="tabular-nums"
                      >
                        {pad(h)}
                      </Typography>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="max-h-48 overflow-y-auto border-r border-black/[0.04]">
              <ul className="py-1">
                {MINUTES.map((m) => (
                  <li key={`m-${m}`}>
                    <button
                      type="button"
                      onClick={() => commit(hour12, m, periodValue)}
                      className={cn(
                        "flex w-full items-center justify-center px-2 py-1.5 transition",
                        m === minute
                          ? "bg-[#C45A7A] font-semibold text-white"
                          : "text-[#212121] hover:bg-[#F7F7F5]"
                      )}
                    >
                      <Typography
                        variant="label-1"
                        as="span"
                        className="tabular-nums"
                      >
                        {pad(m)}
                      </Typography>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <ul className="py-1">
                {(["AM", "PM"] as const).map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => commit(hour12, minute, p)}
                      className={cn(
                        "flex w-full items-center justify-center px-2 py-1.5 transition",
                        p === periodValue
                          ? "bg-[#C45A7A] font-semibold text-white"
                          : "text-[#212121] hover:bg-[#F7F7F5]"
                      )}
                    >
                      <Typography variant="label-1" as="span">
                        {p}
                      </Typography>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-black/[0.06] px-3 py-2">
            <button
              type="button"
              className="font-medium text-[#8A8A8A] transition hover:text-[#212121]"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <Typography variant="caption-1" as="span">
                Clear
              </Typography>
            </button>
            <button
              type="button"
              className="rounded-md bg-[#FCCC2D] px-3 py-1.5 font-semibold text-[#212121] transition hover:brightness-105"
              onClick={() => setOpen(false)}
            >
              <Typography variant="caption-1" as="span">
                Done
              </Typography>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
