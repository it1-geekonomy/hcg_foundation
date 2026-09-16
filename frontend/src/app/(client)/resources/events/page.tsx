"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import { EVENTS_DATA, EventItem } from "@/domains/resources/constants/events";

const CONTAINER = "max-w-[1722px] mx-auto px-4 sm:px-8 lg:px-[72px]";
const ITEMS_PER_PAGE = 4;

export default function EventsPage() {
  const [events] = useState<EventItem[]>(EVENTS_DATA);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {currentEvents.map((eventItem) => (
            <Link
              key={eventItem.id}
              href={`/resources/events/${eventItem.id}`}
              className="group relative block aspect-[16/11] sm:aspect-[16/10] xl:aspect-[600/380] w-full min-h-[260px] sm:min-h-[300px] overflow-hidden rounded-[8px] sm:rounded-[10px] bg-[#EFEAD8] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={eventItem.imageUrl}
                alt={eventItem.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 xl:inset-x-5 xl:bottom-5 p-3 sm:p-4 lg:p-5 xl:pt-[28.8px] xl:pr-[41.8px] xl:pb-[27.9px] xl:pl-[27.9px] flex items-center justify-between gap-3 sm:gap-4 rounded-[6px] border border-white/10 bg-[#8D8D8D]/40 backdrop-blur-[28px] text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 xl:gap-[9.3px]">
                  <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl font-normal text-white font-manrope drop-shadow-xs line-clamp-1 group-hover:text-[#FCCC2D] transition">
                    {eventItem.title}
                  </h2>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal">
                    <Calendar className="size-3 sm:size-3.5 xl:size-4 text-white/90 shrink-0" />
                    <span className="truncate">Project Date: {eventItem.date}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="flex items-center justify-center gap-1.5 xl:gap-[9.3px] px-3 py-2 sm:px-3.5 sm:py-2.5 xl:w-[176px] xl:h-[57px] xl:py-[9.3px] xl:pr-[9.3px] xl:pl-[17.6px] rounded-[6px] border border-white/10 bg-[#FCCC2D] backdrop-blur-[21px] text-[#382E07] text-xs sm:text-sm font-semibold shadow-xs transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105 cursor-pointer">
                    <span className="whitespace-nowrap">Read More</span>
                    <ArrowUpRight className="size-3.5 sm:size-4 xl:size-5 text-[#382E07] shrink-0" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 sm:mt-14 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrevPage}
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
                onClick={handleNextPage}
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

            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
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
          </div>
        )}
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
