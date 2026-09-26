"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  showNumbers?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showDots = true,
  showArrows = true,
  showNumbers = false,
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

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // When totalPages > 4:
    // If currentPage is near start (page 1 or 2): 1, 2, '...', totalPages
    if (currentPage <= 2) {
      return [1, 2, "...", totalPages];
    }

    // If currentPage is near end (totalPages - 1 or totalPages): 1, '...', totalPages - 1, totalPages
    if (currentPage >= totalPages - 1) {
      return [1, "...", totalPages - 1, totalPages];
    }

    // If currentPage is in the middle: 1, '...', currentPage, '...', totalPages
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-1.5 ${className}`}>
      {/* Previous Arrow (<) */}
      {showArrows && totalPages > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FDC61D] mr-0.5 sm:mr-1"
        >
          <ChevronLeft className="size-3.5 sm:size-4" />
        </button>
      )}

      {/* Page Indicator Dots */}
      {showDots && !showNumbers && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-7 bg-[#FDC61D]"
                    : "w-2 bg-[#EFE4C8] hover:bg-[#E9B510]/60"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Numbered Pagination (Small & Compact: 1 .. last) */}
      {showNumbers && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-0.5">
          {getPageNumbers().map((item, index) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-0.5 text-[#8C826B] font-bold text-xs select-none tracking-wider"
                >
                  ...
                </span>
              );
            }
            const pageNum = item as number;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`${pageNum}-${index}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                className={`flex size-6 sm:size-7 items-center justify-center rounded-full font-manrope font-semibold text-xs transition cursor-pointer ${
                  isActive
                    ? "bg-[#FDC61D] text-[#382E07] shadow-xs"
                    : "bg-transparent text-[#2D2D2D] hover:bg-[#EFE4C8]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Arrow (>) */}
      {showArrows && totalPages > 1 && (
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FDC61D] ml-0.5 sm:ml-1"
        >
          <ChevronRight className="size-3.5 sm:size-4" />
        </button>
      )}
    </div>
  );
}
