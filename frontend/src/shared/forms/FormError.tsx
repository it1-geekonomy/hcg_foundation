import React from "react";
import Typography from "@/lib/Typography";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export default function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className={`mt-0.5 ${className}`}>
      <Typography variant="caption-1" as="span" className="text-red-500">
        {message}
      </Typography>
    </div>
  );
}
