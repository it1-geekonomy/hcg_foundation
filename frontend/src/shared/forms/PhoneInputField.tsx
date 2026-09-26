"use client";

import React, { useState, useEffect, useMemo } from "react";
import Typography from "@/lib/Typography";
import CountrySelect from "@/shared/components/CountrySelect";
import {
  DONATION_COUNTRIES,
  getDonationCountry,
} from "@/domains/home/constants/countries";

interface PhoneInputFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string;
  hideLabel?: boolean;
  placeholder?: string;
  containerClassName?: string;
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

  // Extract only national digits
  const nationalDigits = useMemo(() => {
    if (!value) return "";
    const trimmed = value.trim();
    const dialDigits = country.dial.replace(/\D/g, "");
    let digits = trimmed.replace(/\D/g, "");
    if (dialDigits && digits.startsWith(dialDigits)) {
      digits = digits.slice(dialDigits.length);
    }
    return digits;
  }, [value, country.dial]);

  const handleCountryChange = (nextCode: string) => {
    setSelectedCountryCode(nextCode);
    const nextCountry = getDonationCountry(nextCode);
    if (nationalDigits) {
      onChange(`${nextCountry.dial} ${nationalDigits}`);
    }
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    const dialDigits = country.dial.replace(/\D/g, "");
    if (
      dialDigits &&
      digits.startsWith(dialDigits) &&
      digits.length > dialDigits.length
    ) {
      digits = digits.slice(dialDigits.length);
    }
    digits = digits.slice(0, 15);
    if (!digits) {
      onChange("");
    } else {
      onChange(`${country.dial} ${digits}`);
    }
  };

  if (hideLabel) {
    return (
      <div className="relative">
        <div
          className={`${
            nationalDigits.trim()
              ? "min-h-[2.2rem] h-auto pb-1"
              : "h-[41.14px] pb-0.5"
          } flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all ${containerClassName}`}
        >
          <label className="block text-[0.72rem] leading-tight font-medium text-[#0D2838]">
            {label}
            {required ? "*" : ""}
          </label>
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
          <div className="mt-0.5">
            <Typography
              variant="caption-1"
              as="span"
              className="font-manrope font-normal text-red-500"
            >
              {error}
            </Typography>
          </div>
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
      <div className="w-full border-b border-[#C7B793] py-1 text-[#2E1C12] flex items-center gap-2">
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
            className="font-manrope font-normal text-red-500"
          >
            {error}
          </Typography>
        </div>
      )}
    </div>
  );
}
