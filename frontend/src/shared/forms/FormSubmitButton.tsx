import React from "react";
import Typography from "@/lib/Typography";

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
      className={`mt-4 w-full rounded-md bg-[#FDC61D] py-3.5 sm:py-4 shadow-xs transition hover:bg-[#E9B510] active:scale-[0.99] cursor-pointer ${className}`}
      {...props}
    >
      <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#382E07]">
        {children}
      </Typography>
    </button>
  );
}
