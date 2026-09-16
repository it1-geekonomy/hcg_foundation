import React from "react";

interface FormSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function FormSubmitButton({
  children,
  className = "",
  type = "submit",
  ...props
}: FormSubmitButtonProps) {
  return (
    <button
      type={type}
      className={`mt-4 w-full font-manrope rounded-[6px] bg-[#FDC61D] py-3.5 sm:py-4 text-base sm:text-lg font-bold text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-[0.99] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
