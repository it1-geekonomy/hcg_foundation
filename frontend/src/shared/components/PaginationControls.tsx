"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showDots?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showDots = true,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Arrow Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`flex size-9 sm:size-10 items-center justify-center rounded-full shadow-xs transition active:scale-95 cursor-pointer ${
            currentPage === 1
              ? "bg-[#EFE4C8] text-[#8C826B] opacity-60 cursor-not-allowed"
              : "bg-[#FDC61D] text-[#382E07] hover:bg-[#E9B510]"
          }`}
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`flex size-9 sm:size-10 items-center justify-center rounded-full shadow-xs transition active:scale-95 cursor-pointer ${
            currentPage === totalPages
              ? "bg-[#EFE4C8] text-[#8C826B] opacity-60 cursor-not-allowed"
              : "bg-[#FDC61D] text-[#382E07] hover:bg-[#E9B510]"
          }`}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Page Indicator Dots */}
      {showDots && totalPages > 1 && (
        <div className="mt-1 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-8 bg-[#FDC61D]"
                    : "w-2.5 bg-[#EFE4C8] hover:bg-[#E9B510]/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
