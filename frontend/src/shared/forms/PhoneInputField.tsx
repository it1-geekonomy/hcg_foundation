"use client";

import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Typography from "@/lib/Typography";

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
  if (hideLabel) {
    return (
      <div className="relative">
        <div className={`h-[2.57rem] flex flex-col justify-between border-b border-[#E5E0D0] pb-0.5 focus-within:border-[#FED034] transition-colors [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-[#0D2838] [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:text-[0.78rem] [&_.PhoneInputInput]:leading-[150%] [&_.PhoneInputInput]:tracking-[0.03em] [&_.PhoneInputInput]:font-medium [&_.PhoneInputInput]:placeholder:text-[#0D2838] [&_input::placeholder]:text-[#0D2838] [&_input::placeholder]:opacity-100 [&_.PhoneInputInput]:font-manrope [&_.PhoneInputCountrySelect]:bg-[#FFF4D4] [&_.PhoneInputCountrySelect]:border-none [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountrySelect]:text-[#0D2838] [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelectArrow]:text-[#0D2838] [&_.PhoneInputCountrySelectArrow]:border-[#0D2838] [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:rounded-xs [&_.PhoneInputCountryIcon]:shadow-xs ${containerClassName}`}>
          <label className="block text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838]">
            {label}{required ? "*" : ""}
          </label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={value || undefined}
            onChange={onChange}
            className="flex items-center gap-2 bg-transparent focus:outline-none w-full"
          />
        </div>
        {error && (
          <div className="mt-0.5">
            <Typography variant="caption-1" as="span" className="font-manrope font-normal text-red-500">
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
        <Typography variant="body-8" as="span" className="font-manrope font-medium text-[#4D4539]">
          {label}
        </Typography>
        {required && (
          <span className="ml-0.5">
            <Typography variant="body-8" as="span" className="font-manrope font-medium text-[#4D4539]">
              *
            </Typography>
          </span>
        )}
      </label>
      <div className="w-full border-b border-[#C7B793] py-1 text-[#2E1C12] [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-[#2E1C12] [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:text-base [&_.PhoneInputCountrySelect]:bg-[#FFF4D4] [&_.PhoneInputCountrySelect]:border-none [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountrySelect]:text-[#2E1C12] [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:rounded-xs [&_.PhoneInputCountryIcon]:shadow-xs">
        <PhoneInput
          international
          defaultCountry="IN"
          placeholder={placeholder ?? `${label}${required ? "*" : ""}`}
          value={value || undefined}
          onChange={onChange}
          className="flex items-center gap-2 bg-transparent focus:outline-none"
        />
      </div>
      {error && (
        <div className="mt-0.5">
          <Typography variant="caption-1" as="span" className="font-manrope font-normal text-red-500">
            {error}
          </Typography>
        </div>
      )}
    </div>
  );
}
