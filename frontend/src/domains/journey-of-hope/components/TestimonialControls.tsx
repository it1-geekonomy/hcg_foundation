"use client";

import React from "react";

interface TestimonialControlsProps {
  currentIndex: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  onSelect: (index: number) => void;
}

export default function TestimonialControls({
  currentIndex,
  total,
  onSelect,
}: TestimonialControlsProps) {
  return (
    <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
      {/* Testimonial Indicator Dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? "w-8 bg-[#FCCC2D]"
                  : "w-2.5 bg-[#F3DB8C] hover:bg-[#E9B510]/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
