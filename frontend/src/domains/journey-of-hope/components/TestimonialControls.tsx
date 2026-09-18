"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialControlsProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export default function TestimonialControls({
  currentIndex,
  total,
  onPrev,
  onNext,
  onSelect,
}: TestimonialControlsProps) {
  return (
    <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous testimonial"
          className="flex size-10 sm:size-10.5 items-center justify-center rounded-full bg-[#F3DB8C] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next testimonial"
          className="flex size-10 sm:size-10.5 items-center justify-center rounded-full bg-[#FCCC2D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Testimonial Indicator Dots */}
      <div className="mt-1 flex items-center justify-center gap-2">
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
