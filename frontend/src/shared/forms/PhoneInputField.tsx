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
        <Typography variant="body-8" as="span" className="text-[#4D4539]">
          {label}
        </Typography>
        {required && (
          <span className="ml-0.5">
            <Typography variant="body-8" as="span" className="text-[#4D4539]">
              *
            </Typography>
          </span>
        )}
      </label>
      <div className="custom-phone-input-wrapper w-full border-b border-[#C7B793] py-1 text-[#2E1C12]">
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
          <Typography variant="caption-1" as="span" className="text-red-500">
            {error}
          </Typography>
        </div>
      )}
      
      <style jsx global>{`
        .custom-phone-input-wrapper .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #2E1C12;
          font-family: inherit;
          font-size: 1rem;
          width: 100%;
        }
        .custom-phone-input-wrapper .PhoneInputCountrySelect {
          background: #FFF4D4;
          border: none;
          outline: none;
          color: #2E1C12;
          font-family: inherit;
          cursor: pointer;
        }
        .custom-phone-input-wrapper .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1rem;
          border-radius: 0.125rem;
          box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
