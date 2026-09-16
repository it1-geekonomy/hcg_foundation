import React from "react";

interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  isTextArea?: boolean;
  rows?: number;
  error?: string;
}

export default function FormField({
  label,
  required = false,
  isTextArea = false,
  rows = 2,
  error,
  className = "",
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1 font-manrope">
      <label htmlFor={fieldId} className="font-manrope text-xs sm:text-sm font-semibold text-[#4D4539]">
        {label}
        {required && <span className="text-[#4D4539] ml-0.5">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={fieldId}
          rows={rows}
          className={`w-full font-manrope border-b border-[#C7B793] bg-transparent py-1.5 text-sm sm:text-base text-[#2E1C12] placeholder:text-[#9E9075] focus:border-[#2E1C12] focus:outline-none transition ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          className={`w-full font-manrope border-b border-[#C7B793] bg-transparent py-1.5 text-sm sm:text-base text-[#2E1C12] placeholder:text-[#9E9075] focus:border-[#2E1C12] focus:outline-none transition ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <span className="text-xs font-manrope text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}
