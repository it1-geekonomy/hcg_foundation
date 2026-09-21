"use client";

import React, { useState, useEffect } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  if (allRelatedEvents.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, allRelatedEvents.length - visibleCount);
  const safeIndex = Math.min(currentIndex, maxIndex);
  const totalPages = maxIndex + 1;

  const getTransformStyle = () => {
    if (visibleCount === 1) {
      return `translateX(calc(-${safeIndex} * (100% + 1.5rem)))`;
    }
    if (visibleCount === 2) {
      return `translateX(calc(-${safeIndex} * ((100% + 1.5rem) / 2)))`;
    }
    return `translateX(calc(-${safeIndex} * ((100% + 2rem) / 3)))`;
  };

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

      {/* Animated Horizontal Sliding Track matching Figma Frame 36 */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-out gap-6 lg:gap-8"
          style={{ transform: getTransformStyle() }}
        >
          {allRelatedEvents.map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
            >
              <EventCard event={item} headingTag="h3" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Centered Pagination Controls */}
      <PaginationControls
        currentPage={safeIndex + 1}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentIndex(page - 1)}
        className="mt-8 sm:mt-10"
      />
    </section>
  );
}
