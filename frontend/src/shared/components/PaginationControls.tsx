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

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {/* Previous Arrow */}
      {showArrows && (
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

      {/* Numbered Pagination */}
      {showNumbers && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-1">
          {getPageNumbers().map((item, index) => {
            if (item === '...') {
              return (
                <span key={`dots-${index}`} className="px-1 text-[#8C826B] font-medium">
                  ...
                </span>
              );
            }
            const pageNum = item as number;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                className={`flex size-8 sm:size-10 items-center justify-center rounded-full font-manrope font-semibold text-sm sm:text-base transition cursor-pointer ${
                  isActive
                    ? "bg-[#FDC61D] text-[#382E07] shadow-sm"
                    : "bg-transparent text-[#2D2D2D] hover:bg-[#EFE4C8]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Arrow */}
      {showArrows && (
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
      )}
    </div>
  );
}
