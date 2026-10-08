"use client";

import React, { useState, useEffect, useMemo } from "react";
import Typography from "@/lib/Typography";
import CountrySelect from "@/shared/components/CountrySelect";
import {
  DONATION_COUNTRIES,
  getDonationCountry,
} from "@/domains/home/constants/countries";
import { nationalPhoneDigits } from "@/shared/lib/phone";

interface PhoneInputFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
  hideLabel?: boolean;
  placeholder?: string;
  containerClassName?: string;
  /** Render the error below the underline without adding height (compact variant only). */
  floatingError?: boolean;
}

export default function PhoneInputField({
  label = "Phone Number",
  required = false,
  value,
  onChange,
  error,
  hideLabel = false,
  placeholder,
  containerClassName = "",
  floatingError = false,
}: PhoneInputFieldProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const country = getDonationCountry(selectedCountryCode);

  // Sync country code from dial code if value has one (e.g. +233, +1, +91)
  useEffect(() => {
    if (!value) {
      setSelectedCountryCode("IN");
      return;
    }
    const trimmed = value.trim();
    if (trimmed.startsWith("+")) {
      const matched = [...DONATION_COUNTRIES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find((c) => trimmed.startsWith(c.dial));
      if (matched && matched.code !== selectedCountryCode) {
        setSelectedCountryCode(matched.code);
      }
    }
  }, [value]);

  const nationalDigits = useMemo(
    () => (value ? nationalPhoneDigits(value, country.dial) : ""),
    [value, country.dial]
  );

  const handleCountryChange = (nextCode: string) => {
    setSelectedCountryCode(nextCode);
    const nextCountry = getDonationCountry(nextCode);
    if (nationalDigits) {
      onChange(`${nextCountry.dial} ${nationalDigits}`);
    }
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = nationalPhoneDigits(e.target.value, country.dial, nationalDigits);
    if (!digits) {
      onChange("");
    } else {
      onChange(`${country.dial} ${digits}`);
    }
  };

  if (hideLabel) {
    return (
      <div className="relative flex flex-col">
        <div
          className={`min-h-[2.35rem] sm:min-h-[2.85rem] h-auto pb-1 flex flex-col justify-between border-b ${
            error
              ? "border-red-500"
              : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
          } transition-all ${containerClassName}`}
        >
          <div className="flex items-center w-full">
            <label className="block text-[0.72rem] leading-tight font-medium text-[#0D2838]">
              {label}
              {required ? "*" : ""}
            </label>
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <CountrySelect
              value={selectedCountryCode}
              onChange={handleCountryChange}
              variant="dial"
              showDialInButton={false}
              theme="light"
            />
            <span className="shrink-0 text-[0.82rem] leading-none font-medium text-[#0D2838] select-none">
              {country.dial}
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={nationalDigits}
              onChange={handleDigitsChange}
              placeholder={placeholder || ""}
              className="w-full bg-transparent text-[0.82rem] leading-none font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838]/40 font-manrope pl-1"
            />
          </div>
        </div>
        {error && (
          <span className="block text-[0.72rem] text-red-600 font-manrope font-medium mt-1.5 leading-tight">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="block">
        <Typography
          variant="body-8"
          as="span"
          className="font-manrope font-medium text-[#4D4539]"
        >
          {label}
        </Typography>
        {required && (
          <span className="ml-0.5">
            <Typography
              variant="body-8"
              as="span"
              className="font-manrope font-medium text-[#4D4539]"
            >
              *
            </Typography>
          </span>
        )}
      </label>
      <div className={`w-full border-b ${error ? "border-red-500" : "border-[#C7B793]"} py-1 text-[#2E1C12] flex items-center gap-2`}>
        <CountrySelect
          value={selectedCountryCode}
          onChange={handleCountryChange}
          variant="dial"
          showDialInButton={false}
          theme="light"
        />
        <span className="shrink-0 text-base font-medium text-[#2E1C12] select-none">
          {country.dial}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={nationalDigits}
          onChange={handleDigitsChange}
          placeholder={placeholder ?? `${label}${required ? "*" : ""}`}
          className="w-full bg-transparent text-base font-medium text-[#2E1C12] focus:outline-hidden placeholder:text-[#2E1C12]/40"
        />
      </div>
      {error && (
        <div className="mt-0.5">
          <Typography
            variant="caption-1"
            as="span"
            className="font-manrope font-normal text-red-600 text-xs block"
          >
            {error}
          </Typography>
        </div>
      )}
    </div>
  );
}
