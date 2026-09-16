import React from "react";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export default function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  return (
    <span className={`text-xs font-sans text-red-500 font-medium ${className}`}>
      {message}
    </span>
  );
}
