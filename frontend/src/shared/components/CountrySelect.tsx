"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DONATION_COUNTRIES,
  getDonationCountry,
} from "@/domains/home/constants/countries";
import CountryFlag from "@/shared/components/CountryFlag";

type Props = {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  variant?: "name" | "dial";
  borderClassName?: string;
  chevronClassName?: string;
  textClassName?: string;
  theme?: "dark" | "light";
  showDialInButton?: boolean;
};

export default function CountrySelect({
  id,
  value,
  onChange,
  variant = "name",
  borderClassName,
  chevronClassName,
  textClassName,
  theme = "dark",
  showDialInButton = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = getDonationCountry(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DONATION_COUNTRIES;
    return DONATION_COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q) ||
        country.dial.includes(q),
    );
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  const isLight = theme === "light";
  const resolvedText = textClassName ?? (isLight ? "text-[#0D2838]" : "text-white");
  const resolvedChevron = chevronClassName ?? (isLight ? "text-[#0D2838]/70" : "text-white/70");
  const resolvedBorder = borderClassName ?? (isLight ? "border-[#A3A3A399]" : "border-white/35");

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 bg-transparent text-left font-manrope text-sm ${resolvedText} outline-none ${
          variant === "dial"
            ? "w-auto shrink-0 py-1"
            : `w-full min-w-0 rounded border px-3 py-2.5 ${resolvedBorder}`
        }`}
      >
        <CountryFlag
          code={selected.code}
          title={selected.name}
          className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover sm:h-4 sm:w-6"
        />
        {variant === "dial" ? (
          showDialInButton ? (
            <span className="shrink-0 whitespace-nowrap text-[0.82rem] font-medium">
              {selected.dial}
            </span>
          ) : null
        ) : (
          <span className="min-w-0 flex-1 truncate">
            {selected.name}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 ${resolvedChevron}`} />
      </button>

      {open ? (
        <div
          className={`absolute top-full z-[70] mt-1 overflow-hidden rounded-md border shadow-xl ${
            isLight
              ? "border-[#E5E0D0] bg-white text-[#0D2838]"
              : "border-white/20 bg-[#2a2a2a] text-white"
          } ${
            variant === "dial" ? "left-0 w-[240px] max-w-[85vw] sm:w-[260px]" : "inset-x-0"
          }`}
        >
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country..."
            className={`w-full border-b px-3 py-2 font-manrope text-sm outline-none ${
              isLight
                ? "border-[#E5E0D0] bg-white text-[#0D2838] placeholder:text-[#A3A3A3]"
                : "border-white/15 bg-transparent text-white placeholder:text-white/40"
            }`}
          />
          <ul
            role="listbox"
            className="max-h-[min(11rem,35vh)] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li
                className={`px-3 py-2 font-manrope text-sm ${
                  isLight ? "text-[#7A746E]" : "text-white/50"
                }`}
              >
                No countries found
              </li>
            ) : (
              filtered.map((country) => {
                const active = country.code === selected.code;
                return (
                  <li key={country.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(country.code);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full min-w-0 items-center gap-2 px-3 py-1.5 text-left font-manrope text-sm transition-colors ${
                        isLight
                          ? active
                            ? "bg-[#FFF4D4] font-medium text-[#0D2838]"
                            : "text-[#0D2838] hover:bg-[#F9F6EE]"
                          : active
                          ? "bg-white/10 text-[#FCCC2D]"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <CountryFlag
                        code={country.code}
                        title={country.name}
                        className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs sm:text-sm">
                        {country.name}
                      </span>
                      <span
                        className={`shrink-0 font-manrope text-xs ${
                          isLight ? "text-[#7A746E]" : "text-white/50"
                        }`}
                      >
                        {country.dial}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}