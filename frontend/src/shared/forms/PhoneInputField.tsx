"use client";

import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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
    <div className="flex flex-col gap-1 font-manrope">
      <label className="font-manrope text-xs sm:text-sm font-semibold text-[#4D4539]">
        {label}
        {required && <span className="text-[#4D4539] ml-0.5">*</span>}
      </label>
      <div className="custom-phone-input-wrapper w-full border-b border-[#C7B793] py-1 text-sm sm:text-base text-[#2E1C12]">
        <PhoneInput
          international
          defaultCountry="IN"
          value={value}
          onChange={onChange}
          className="flex items-center gap-2 bg-transparent focus:outline-none"
        />
      </div>
      {error && <span className="text-xs font-manrope text-red-500 mt-0.5">{error}</span>}
      
      <style jsx global>{`
        .custom-phone-input-wrapper .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #2E1C12;
          font-family: inherit;
          font-size: 0.95rem;
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
          width: 24px;
          height: 16px;
          border-radius: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
