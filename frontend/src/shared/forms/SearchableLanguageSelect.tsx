"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search, Check, X, PlusCircle } from "lucide-react";

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
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

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
        setIsOtherMode(false);
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
        setIsOtherMode(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus appropriate input when opened
  useEffect(() => {
    if (isOpen) {
      if (isOtherMode) {
        customInputRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    }
  }, [isOpen, isOtherMode]);

  const toggleLanguage = (lang: string) => {
    if (lang === "Other") {
      setIsOtherMode(true);
      setCustomLang(searchTerm.trim());
      return;
    }

    let updated: string[];
    if (selectedLanguages.includes(lang)) {
      updated = selectedLanguages.filter((item) => item !== lang);
    } else {
      updated = [...selectedLanguages, lang];
    }
    onChange(updated.join(", "));
  };

  const handleSaveCustom = () => {
    const trimmed = customLang.trim();
    if (trimmed) {
      if (!selectedLanguages.includes(trimmed)) {
        onChange([...selectedLanguages, trimmed].join(", "));
      }
      setCustomLang("");
      setIsOtherMode(false);
      setSearchTerm("");
    }
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

      {/* Trigger Bar */}
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsOtherMode(false);
        }}
        className={`${
          selectedLanguages.length > 0
            ? "min-h-[2.2rem] h-auto pb-1.5"
            : "h-[41.14px] pb-[21.66px]"
        } flex items-start border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all cursor-pointer select-none`}
      >
        <div className="flex items-start gap-1.5 min-w-0 max-w-full">
          <Globe className="size-4 text-[#0D2838] shrink-0 mr-1.5 mt-0.5" />
          <span className="text-[0.82rem] leading-normal font-medium font-manrope text-[#0D2838] break-words whitespace-normal">
            {selectedLanguages.length > 0
              ? selectedLanguages.join(", ")
              : placeholder}
          </span>
          <ChevronDown
            className={`size-3.5 text-[#0D2838] shrink-0 mt-0.5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Elevated Dropdown Panel with Search Bar */}
      {isOpen && (
        <div className="absolute right-0 w-full min-w-[250px] max-w-[90vw] top-full mt-1.5 z-50 bg-white border border-[#E5E0D0] rounded-lg shadow-2xl overflow-hidden font-manrope animate-in fade-in-50 zoom-in-95 duration-150">
          {!isOtherMode ? (
            <>
              {/* Search Input Bar */}
              <div className="p-2 border-b border-[#F0EBE0] bg-[#FAF8F5]">
                <div className="flex items-center bg-white border border-[#E5E0D0] rounded-md px-2.5 py-1.5 focus-within:border-[#FCCC2D] transition-colors">
                  <Search className="size-3.5 text-[#8C8275] shrink-0 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full bg-transparent text-[0.75rem] text-[#0D2838] focus:outline-hidden placeholder:text-[#A09578] font-medium"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-[#8C8275] hover:text-[#0D2838] p-0.5 cursor-pointer"
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
                  <div className="py-2.5 px-3 text-center text-[0.75rem] text-[#8C8275]">
                    No languages match &ldquo;{searchTerm}&rdquo;
                  </div>
                )}

                {/* Option to add custom language */}
                <div
                  onClick={() => {
                    setIsOtherMode(true);
                    setCustomLang(searchTerm.trim());
                  }}
                  className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-[#F0ECE1] rounded-md cursor-pointer text-[0.78rem] font-medium text-[#B87A00] hover:bg-[#FFF9EA] transition-colors"
                >
                  <PlusCircle className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {searchTerm.trim()
                      ? `Other: Add "${searchTerm.trim()}"`
                      : "Other (Type custom language)"}
                  </span>
                </div>
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
                      className="text-red-500 hover:underline font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-[#0D2838] font-semibold hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </>
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
                  Add Other Language
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
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  placeholder="e.g. French, German, Tulu..."
                  className="w-full bg-[#FAF8F5] border border-[#E5E0D0] rounded-md px-3 py-1.5 text-[0.82rem] font-medium text-[#0D2838] focus:border-[#FCCC2D] focus:bg-white outline-none font-manrope transition-colors"
                />
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="text-[0.7rem] text-[#8C8275] leading-tight">
                    Press Enter or click Add
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    disabled={!customLang.trim()}
                    className="px-4 py-1.5 bg-[#FCCC2D] hover:bg-[#eab820] disabled:opacity-50 disabled:cursor-not-allowed text-[#0D2838] font-semibold text-[0.78rem] rounded-md transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Add
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
