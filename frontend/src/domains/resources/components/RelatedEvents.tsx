"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EVENTS_DATA } from "@/domains/resources/constants/events";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface RelatedEventsProps {
  currentEventId: string;
}

export default function RelatedEvents({ currentEventId }: RelatedEventsProps) {
  const allRelatedEvents = EVENTS_DATA.filter((e) => e.id !== currentEventId);
  const [relatedPage, setRelatedPage] = useState(1);
  const RELATED_PER_PAGE = 2;
  const totalRelatedPages = Math.ceil(allRelatedEvents.length / RELATED_PER_PAGE);

  // Group related events into pages of RELATED_PER_PAGE cards each (1 row = 2 cards)
  const relatedPages = Array.from({ length: totalRelatedPages }, (_, pageIndex) => {
    const start = pageIndex * RELATED_PER_PAGE;
    if (start + RELATED_PER_PAGE > allRelatedEvents.length && allRelatedEvents.length >= RELATED_PER_PAGE) {
      return allRelatedEvents.slice(-RELATED_PER_PAGE);
    }
    return allRelatedEvents.slice(start, start + RELATED_PER_PAGE);
  });

  if (allRelatedEvents.length === 0) {
    return null;
  }

  return (
    <section className={`${CONTAINER} py-8 sm:py-12 border-t border-[#E8DFC5]`}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Typography
          variant="heading-6"
          as="h2"
          className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
        >
          Related Events
        </Typography>
        <Link
          href="/resources/events"
          className="inline-flex items-center gap-1 text-[#2D2D2D] transition hover:text-[#B88700]"
        >
          <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
            View All
          </Typography>
          <ArrowUpRight className="size-4 text-[#2D2D2D]" />
        </Link>
      </div>

      {/* Smooth Horizontal Sliding Track */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(relatedPage - 1) * 100}%)` }}
        >
          {relatedPages.map((pageEvents, pageIdx) => (
            <div
              key={pageIdx}
              className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem]"
            >
              {pageEvents.map((item) => (
                <EventCard
                  key={`${pageIdx}-${item.id}`}
                  event={item}
                  headingTag="h3"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Centered Pagination Navigation Dots Only */}
      <PaginationControls
        currentPage={relatedPage}
        totalPages={totalRelatedPages}
        onPageChange={(page) => setRelatedPage(page)}
        className="mt-[2rem] sm:mt-[2.5rem]"
        showArrows={false}
        showDots={true}
      />
    </section>
  );
}
