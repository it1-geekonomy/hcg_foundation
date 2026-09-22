"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search, Check, X } from "lucide-react";

export const INDIAN_LANGUAGES = [
  "English",
  "Kannada",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Konkani",
  "Kashmiri",
  "Maithili",
  "Manipuri",
  "Nepali",
  "Sanskrit",
  "Sindhi",
  "Bodo",
  "Dogri",
  "Santali",
  "Other",
];

interface SearchableLanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableLanguageSelect({
  value,
  onChange,
  placeholder = "Languages Known*",
  required = false,
}: SearchableLanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse comma-separated string into an array of selected languages
  const selectedLanguages = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Close dropdown on click outside
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

  // Close on Escape key
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

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleLanguage = (lang: string) => {
    let updated: string[];
    if (selectedLanguages.includes(lang)) {
      updated = selectedLanguages.filter((item) => item !== lang);
    } else {
      updated = [...selectedLanguages, lang];
    }
    onChange(updated.join(", "));
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden input for HTML5 form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Trigger Bar (matching Figma input styling) */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center flex-1 min-w-0 mr-2">
          <Globe className="size-4 text-[#0D2838] shrink-0 mr-3" />
          <span
            className={`block truncate text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium font-manrope ${
              selectedLanguages.length > 0 ? "text-[#0D2838]" : "text-[#0D2838]"
            }`}
          >
            {selectedLanguages.length > 0
              ? selectedLanguages.join(", ")
              : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`size-4 text-[#0D2838] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Elevated Dropdown Panel with Search Bar */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E5E0D0] rounded-lg shadow-2xl overflow-hidden font-manrope animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-[#F0EBE0] bg-[#FAF8F5]">
            <div className="flex items-center bg-white border border-[#E5E0D0] rounded-md px-2.5 py-1.5 focus-within:border-[#FCCC2D] transition-colors">
              <Search className="size-3.5 text-[#8C8275] shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Indian languages..."
                className="w-full bg-transparent text-[0.75rem] text-[#0D2838] focus:outline-hidden placeholder:text-[#A09578] font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-[#8C8275] hover:text-[#0D2838] p-0.5"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <div
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-[0.75rem] font-medium transition-colors ${
                      isSelected
                        ? "bg-[#FFF4D4] text-[#0D2838] font-semibold"
                        : "text-[#0D2838] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && (
                      <Check className="size-3.5 text-[#E5A810] shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-[0.75rem] text-[#8C8275]">
                No language found.
              </div>
            )}
          </div>

          {/* Footer with Clear All / Done actions */}
          {selectedLanguages.length > 0 && (
            <div className="px-3 py-2 border-t border-[#F0EBE0] bg-[#FAF8F5] flex items-center justify-between text-[0.7rem]">
              <span className="text-[#8C8275]">
                {selectedLanguages.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-red-500 hover:underline font-medium"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[#0D2838] font-semibold hover:underline"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
