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
  scrollToTop?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showDots = true,
  showArrows = true,
  showNumbers = false,
  scrollToTop = true,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    onPageChange(page);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageClick(currentPage + 1);
    }
  };

  // Always 7 slots once paging kicks in (first, last, current ± 1, and up to two ellipses),
  // so the control keeps the same width while paging. An ellipsis never stands in for a
  // single page — that page is shown instead.
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const SLOTS = 7;
    const range = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, i) => from + i);

    if (totalPages <= SLOTS) return range(1, totalPages);

    if (currentPage <= 4) {
      return [...range(1, 5), "ellipsis", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "ellipsis", ...range(totalPages - 4, totalPages)];
    }
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
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
                onClick={() => handlePageClick(pageNum)}
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
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="flex size-6 sm:size-7 items-center justify-center font-manrope font-semibold text-xs leading-none text-[#8C826B] select-none"
                >
                  …
                </span>
              );
            }
            const pageNum = item;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageClick(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
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
