"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookOpen, ChevronDown, Check } from "lucide-react";
import Typography from "@/lib/Typography";

const VOLUNTEER_AREAS = [
  "Patient Support",
  "Cancer Awareness",
  "Community Outreach",
  "Events & Activities",
  "Fundraising",
  "Other",
];

interface VolunteerInterestSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function VolunteerInterestSelect({
  value,
  onChange,
  required = false,
  className = "",
}: VolunteerInterestSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsOtherMode(false);
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
        setIsOtherMode(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus custom input when entering "Other" mode
  useEffect(() => {
    if (isOtherMode && isOpen) {
      customInputRef.current?.focus();
    }
  }, [isOtherMode, isOpen]);

  const handleSelect = (area: string) => {
    if (area === "Other") {
      setIsOtherMode(true);
      // Pre-fill if current value was already custom
      if (value && !VOLUNTEER_AREAS.slice(0, 5).includes(value)) {
        setCustomText(value);
      } else {
        setCustomText("");
      }
      return;
    }
    onChange(area);
    setIsOpen(false);
    setIsOtherMode(false);
  };

  const handleSaveCustom = () => {
    if (customText.trim()) {
      onChange(customText.trim());
      setIsOpen(false);
      setIsOtherMode(false);
    }
  };

  return (
    <div className={`relative h-full ${className}`} ref={containerRef}>
      {/* Main bar */}
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsOtherMode(false);
        }}
        className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-1.5" />
          <Typography
            variant="caption-1"
            as="span"
            className="font-medium font-manrope text-[#0D2838] select-none leading-normal"
          >
            Areas of Interest*
          </Typography>
          <ChevronDown
            className={`size-3.5 text-[#0D2838] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        <div className="pl-7 w-full">
          <span className="text-[0.82rem] leading-normal font-medium font-manrope text-[#0D2838] break-words whitespace-normal block min-h-[1.2rem]">
            {value}
          </span>
        </div>
        {/* Hidden input for HTML validation */}
        <input
          type="text"
          required={required}
          value={value}
          readOnly
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 w-full min-w-[240px] max-w-[90vw] top-full mt-1.5 z-50 bg-white border border-[#E5E0D0] rounded-lg shadow-2xl overflow-hidden font-manrope animate-in fade-in-50 zoom-in-95 duration-150">
          {!isOtherMode ? (
            <div className="p-1.5 space-y-0.5 max-h-56 overflow-y-auto">
              {VOLUNTEER_AREAS.map((area) => {
                const isSelected =
                  value === area ||
                  (area === "Other" &&
                    value &&
                    !VOLUNTEER_AREAS.slice(0, 5).includes(value));
                return (
                  <div
                    key={area}
                    onClick={() => handleSelect(area)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[0.78rem] font-medium transition-colors ${
                      isSelected
                        ? "bg-[#FFF4D4] text-[#0D2838] font-semibold"
                        : "text-[#0D2838] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span>{area}</span>
                    {isSelected && (
                      <Check className="size-3.5 text-[#E5A810] shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom type input when "Other" is chosen */
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveCustom();
                }
              }}
              className="p-3 bg-white space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] font-semibold text-[#0D2838]">
                  Enter Other Area of Interest
                </span>
                <button
                  type="button"
                  onClick={() => setIsOtherMode(false)}
                  className="text-xs text-[#8C8275] hover:text-[#0D2838] underline cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="space-y-2">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Counseling, Photography..."
                  className="w-full bg-[#FAF8F5] border border-[#E5E0D0] rounded-md px-3 py-1.5 text-[0.82rem] font-medium text-[#0D2838] focus:border-[#FCCC2D] focus:bg-white outline-none font-manrope transition-colors"
                />
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="text-[0.7rem] text-[#8C8275] leading-tight">
                    Press Enter or click Save
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    disabled={!customText.trim()}
                    className="px-4 py-1.5 bg-[#FCCC2D] hover:bg-[#eab820] disabled:opacity-50 disabled:cursor-not-allowed text-[#0D2838] font-semibold text-[0.78rem] rounded-md transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
