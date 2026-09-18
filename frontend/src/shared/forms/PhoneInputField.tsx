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
}

export default function PhoneInputField({
  label = "Phone Number",
  required = false,
  value,
  onChange,
  error,
}: PhoneInputFieldProps) {
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
          value={value}
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
