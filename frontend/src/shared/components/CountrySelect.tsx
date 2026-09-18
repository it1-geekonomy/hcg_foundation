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
};

export default function CountrySelect({
  id,
  value,
  onChange,
  variant = "name",
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
        country.dialCode.includes(q),
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

  return (
    <div ref={rootRef}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 bg-transparent py-1.5 text-left font-manrope text-sm text-white outline-none ${
          variant === "dial" ? "w-auto shrink-0" : "w-full min-w-0"
        }`}
      >
        <CountryFlag
          code={selected.code}
          title={selected.name}
          className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover sm:h-4 sm:w-6"
        />
        <span
          className={
            variant === "dial"
              ? "shrink-0 whitespace-nowrap"
              : "min-w-0 flex-1 truncate"
          }
        >
          {variant === "dial" ? selected.dialCode : selected.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/70" />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-[70] mt-1 overflow-hidden rounded border border-white/20 bg-[#2a2a2a] shadow-xl">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country"
            className="w-full border-b border-white/15 bg-transparent px-3 py-2 font-manrope text-sm text-white outline-none placeholder:text-white/40"
          />
          <ul
            role="listbox"
            className="max-h-[min(12.5rem,40vh)] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 font-manrope text-sm text-white/50">
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
                      className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left font-manrope text-sm hover:bg-white/10 ${
                        active ? "bg-white/10 text-[#FCCC2D]" : "text-white"
                      }`}
                    >
                      <CountryFlag
                        code={country.code}
                        title={country.name}
                        className="h-4 w-6 shrink-0 rounded-[1px]"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {country.name}
                      </span>
                      <span className="shrink-0 font-manrope text-xs text-white/50">
                        {country.dialCode}
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
