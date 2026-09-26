"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import Typography from "@/lib/Typography";

interface DobDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

// Dynamically generated month names and day headers using native Intl API
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => ({
  index: i,
  short: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2000, i, 1)),
  long: new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, i, 1)),
}));

const DAYS_HEADER = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(new Date(2021, 7, 1 + i)) // Sunday Aug 1, 2021
    .slice(0, 2)
);

export default function DobDatePicker({
  value,
  onChange,
  required = false,
  placeholder = "DOB (DD/MM/YYYY)",
  className = "",
}: DobDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value (DD/MM/YYYY) if present
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year) &&
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31 &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      ) {
        return { day, month, year };
      }
    }
    return null;
  }, [value]);

  // Calendar view state (defaults to year 2002 if no date is set)
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedDate ? parsedDate.year : 2002;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedDate ? parsedDate.month : 0;
  });

  // Sync view when parsedDate changes
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.year);
      setViewMonth(parsedDate.month);
    }
  }, [parsedDate]);

  // Close calendar on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Dynamically calculate birth year options relative to current year (e.g., ages 14 to 100)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - 14;
    const minBirthYear = currentYear - 100;
    const years: number[] = [];
    for (let y = maxBirthYear; y >= minBirthYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute days in current month view
  const { totalDays, firstDayOfWeek } = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    return { totalDays: daysInMonth, firstDayOfWeek: startDay };
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const dStr = String(day).padStart(2, "0");
    const mStr = String(viewMonth + 1).padStart(2, "0");
    onChange(`${dStr}/${mStr}/${viewYear}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    // Handle backspace over slash
    if (inputVal.length < value.length && value.endsWith("/") && !inputVal.endsWith("/")) {
      inputVal = inputVal.slice(0, -1);
    }

    const digits = inputVal.replace(/\D/g, "").slice(0, 8);
    let formatted = "";

    if (digits.length > 0) {
      if (digits.length <= 2) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      }
    }

    onChange(formatted);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control and navigation keys
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block non-digit keys
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`relative h-full ${className}`} ref={containerRef}>
      {/* Trigger Bar */}
      <div
        className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
      >
        <div className="flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="focus:outline-hidden cursor-pointer p-0 mr-3 flex items-center justify-center border-none bg-transparent leading-none shrink-0"
            aria-label="Toggle calendar"
          >
            <CalendarIcon className="size-4 text-[#0D2838] shrink-0 hover:text-[#E5A810] transition-colors" />
          </button>
          <label htmlFor="dob-input" className="cursor-text">
            <Typography
              variant="caption-1"
              as="span"
              className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
            >
              {placeholder}
            </Typography>
          </label>
        </div>
        <div className="pl-7 w-full">
          <input
            id="dob-input"
            type="text"
            required={required}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownInput}
            inputMode="numeric"
            className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope h-[1.2rem] py-0 block"
          />
        </div>
      </div>

      {/* Fully Responsive In-Modal Calendar Popup */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-[70] w-[260px] max-w-[85vw] bg-white border border-[#E5E0D0] rounded-xl shadow-2xl p-3 font-manrope animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Calendar Header with Month & Year selectors */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#F0EBE0]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#FAF8F5] text-[#0D2838] rounded-md transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-semibold text-[#0D2838] outline-none cursor-pointer py-0.5"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.index} value={m.index}>
                    {m.short}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-semibold text-[#0D2838] outline-none cursor-pointer py-0.5"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#FAF8F5] text-[#0D2838] rounded-md transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
            {DAYS_HEADER.map((d) => (
              <span key={d} className="text-[0.68rem] font-semibold text-[#8C8275]">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Day Numbers */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                parsedDate &&
                parsedDate.day === day &&
                parsedDate.month === viewMonth &&
                parsedDate.year === viewYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={`h-7 w-7 text-xs font-medium rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#FCCC2D] text-[#0D2838] font-bold shadow-xs"
                      : "text-[#0D2838] hover:bg-[#FFF4D4]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#F0EBE0] text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#8C8275] hover:text-red-500 font-medium cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const dStr = String(now.getDate()).padStart(2, "0");
                const mStr = String(now.getMonth() + 1).padStart(2, "0");
                onChange(`${dStr}/${mStr}/${now.getFullYear()}`);
                setIsOpen(false);
              }}
              className="text-[#0D2838] font-semibold hover:text-[#B87A00] cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
