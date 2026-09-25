"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, ChevronDown, Check, X, Search, PlusCircle } from "lucide-react";
import { City, State, Country } from "country-state-city";
import Typography from "@/lib/Typography";

// Pre-compute state name map for India using country-state-city library
const indianStatesMap = new Map(
  (State.getStatesOfCountry("IN") || []).map((s) => [s.isoCode, s.name])
);

// All Indian cities sourced directly from country-state-city library
const ALL_INDIAN_CITIES = (City.getCitiesOfCountry("IN") || []).map((c) => {
  const state = indianStatesMap.get(c.stateCode) || "";
  return {
    label: state ? `${c.name}, ${state}` : c.name,
    name: c.name,
    state,
  };
});

// All Indian States from country-state-city library
const ALL_INDIAN_STATES = (State.getStatesOfCountry("IN") || []).map((s) => ({
  label: `${s.name}, India`,
  name: s.name,
}));

// All World Countries from country-state-city library
const ALL_COUNTRIES = (Country.getAllCountries() || []).map((c) => ({
  label: c.name,
  name: c.name,
}));

// Default initial list sourced directly from library
const DEFAULT_LOCATIONS = [
  ...ALL_INDIAN_STATES.slice(0, 10).map((s) => s.label),
  ...ALL_INDIAN_CITIES.slice(0, 20).map((c) => c.label),
];

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function LocationSelect({
  value,
  onChange,
  placeholder = "City / Location*",
  required = false,
  className = "",
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Focus appropriate input when open or entering "Other" mode
  useEffect(() => {
    if (isOpen) {
      if (isOtherMode) {
        customInputRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    }
  }, [isOpen, isOtherMode]);

  // Dynamic filter using country-state-city library
  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return DEFAULT_LOCATIONS;
    }

    // 1. Cities where name starts with query
    const startsCities = ALL_INDIAN_CITIES.filter((c) =>
      c.name.toLowerCase().startsWith(q)
    )
      .slice(0, 15)
      .map((c) => c.label);

    // 2. Cities where name contains query
    const containsCities = ALL_INDIAN_CITIES.filter(
      (c) =>
        !c.name.toLowerCase().startsWith(q) &&
        c.name.toLowerCase().includes(q)
    )
      .slice(0, 15)
      .map((c) => c.label);

    // 3. States matching query
    const matchedStates = ALL_INDIAN_STATES.filter((s) =>
      s.name.toLowerCase().includes(q)
    ).map((s) => s.label);

    // 4. Countries matching query
    const matchedCountries = ALL_COUNTRIES.filter((cnt) =>
      cnt.name.toLowerCase().includes(q)
    )
      .slice(0, 10)
      .map((cnt) => cnt.label);

    const merged = [
      ...startsCities,
      ...containsCities,
      ...matchedStates,
      ...matchedCountries,
    ];

    return Array.from(new Set(merged));
  }, [searchQuery]);

  const handleSelect = (loc: string) => {
    onChange(loc);
    setIsOpen(false);
    setIsOtherMode(false);
    setSearchQuery("");
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setCustomInput("");
    setIsOtherMode(false);
  };

  const handleOpenOther = () => {
    setIsOtherMode(true);
    setCustomInput(searchQuery.trim());
  };

  const handleSaveCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customInput.trim()) {
      onChange(customInput.trim());
      setIsOpen(false);
      setIsOtherMode(false);
      setSearchQuery("");
    }
  };

  return (
    <div className={`relative h-full ${className}`} ref={containerRef}>
      {/* Main Form Input Bar - Displays selected location */}
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsOtherMode(false);
        }}
        className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <User className="size-4 text-[#0D2838] shrink-0 mr-1.5" />
          <Typography
            variant="caption-1"
            as="span"
            className="font-medium font-manrope text-[#0D2838] select-none leading-normal"
          >
            {placeholder}
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
        {/* Hidden input for HTML form validation */}
        <input
          type="text"
          required={required}
          value={value}
          readOnly
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 w-full min-w-[250px] max-w-[90vw] top-full mt-1.5 z-50 bg-white border border-[#E5E0D0] rounded-lg shadow-2xl overflow-hidden font-manrope animate-in fade-in-50 zoom-in-95 duration-150">
          {!isOtherMode ? (
            <>
              {/* Search Box */}
              <div className="p-2 border-b border-[#E5E0D0] flex items-center gap-2 bg-[#FAF8F5]">
                <Search className="size-3.5 text-[#8C8275] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, state or country..."
                  className="w-full bg-transparent text-[0.82rem] font-medium text-[#0D2838] focus:outline-none placeholder:text-[#8C8275]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 text-[#8C8275] hover:text-[#0D2838]"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Suggestions List */}
              <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => {
                    const isSelected =
                      value.trim().toLowerCase() === loc.trim().toLowerCase();
                    return (
                      <div
                        key={loc}
                        onClick={() => handleSelect(loc)}
                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[0.78rem] font-medium transition-colors ${
                          isSelected
                            ? "bg-[#FFF4D4] text-[#0D2838] font-semibold"
                            : "text-[#0D2838] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <span className="truncate">{loc}</span>
                        {isSelected && (
                          <Check className="size-3.5 text-[#E5A810] shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2.5 px-3 text-center text-[0.75rem] text-[#8C8275]">
                    No locations match &ldquo;{searchQuery}&rdquo;
                  </div>
                )}

                {/* "Other" Option (Always available or when not found) */}
                <div
                  onClick={handleOpenOther}
                  className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-[#F0ECE1] rounded-md cursor-pointer text-[0.78rem] font-medium text-[#B87A00] hover:bg-[#FFF9EA] transition-colors"
                >
                  <PlusCircle className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {searchQuery.trim()
                      ? `Other: Use "${searchQuery.trim()}" or type custom`
                      : "Other (Type custom location)"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Custom Location Input Screen when "Other" is selected */
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
                  Enter Custom Location
                </span>
                <button
                  type="button"
                  onClick={() => setIsOtherMode(false)}
                  className="text-xs text-[#8C8275] hover:text-[#0D2838] underline cursor-pointer"
                >
                  Back to search
                </button>
              </div>

              <div className="space-y-2">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. My Town, District..."
                  className="w-full bg-[#FAF8F5] border border-[#E5E0D0] rounded-md px-3 py-1.5 text-[0.82rem] font-medium text-[#0D2838] focus:border-[#FCCC2D] focus:bg-white outline-none font-manrope transition-colors"
                />
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="text-[0.7rem] text-[#8C8275] leading-tight">
                    Press Enter or click Save
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSaveCustom()}
                    disabled={!customInput.trim()}
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
