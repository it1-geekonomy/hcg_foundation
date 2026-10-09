"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard, { type EventItem } from "@/domains/resources/components/EventCard";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface RelatedEventsProps {
  currentEventId?: string;
  events?: EventItem[];
}

export default function RelatedEvents({ currentEventId, events }: RelatedEventsProps) {
  const [allRelatedEvents, setAllRelatedEvents] = useState<EventItem[]>(events ?? []);
  const [loading, setLoading] = useState(!events);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isDraggingOverThreshold = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollContainerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='button'], [data-no-drag='true']")) {
      return;
    }
    setIsDragging(true);
    isDraggingOverThreshold.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    if (e.pointerType === "mouse" && e.buttons !== 1) {
      handlePointerUp(e);
      return;
    }
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(x - startX) > 6) {
      isDraggingOverThreshold.current = true;
      e.preventDefault();
      try {
        if (!scrollContainerRef.current.hasPointerCapture(e.pointerId)) {
          scrollContainerRef.current.setPointerCapture(e.pointerId);
        }
      } catch {}
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    setIsDragging(false);
    if (e && scrollContainerRef.current) {
      try {
        if (scrollContainerRef.current.hasPointerCapture(e.pointerId)) {
          scrollContainerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
    setTimeout(() => {
      isDraggingOverThreshold.current = false;
    }, 50);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingOverThreshold.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (events && events.length > 0) {
      setAllRelatedEvents(events);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicEventsApi.listPublished({ limit: 4 });
        if (!cancelled) {
          const mapped = (res.data ?? [])
            .filter((e) => (e.slug || e.id) !== currentEventId)
            .slice(0, 3)
            .map((e) => ({
              id: e.id ?? "",
              slug: e.slug ?? "",
              title: e.title ?? "",
              date: e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
              category: "Community Event" as const,
              summary: e.shortDescription ?? "",
              fullStory: e.content ?? "",
              imageUrl: e.eventBanner || e.eventMobileBanner || "",
              mobileImageUrl: e.eventMobileBanner || e.eventBanner || "",
              location: e.eventLocation ?? "",
            }));
          setAllRelatedEvents(mapped);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [events, currentEventId]);

  if (!loading && allRelatedEvents.length === 0) {
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
          href="/events"
          className="inline-flex items-center gap-1 text-[#2D2D2D] transition hover:text-[#B88700]"
        >
          <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
            View All
          </Typography>
          <ArrowUpRight className="size-4 text-[#2D2D2D]" />
        </Link>
      </div>

      <div
        ref={scrollContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
        className={`mt-6 sm:mt-8 flex overflow-x-auto gap-6 sm:gap-8 no-scrollbar pb-4 sm:pb-0 touch-pan-y ${isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"}`}
      >
        {allRelatedEvents.map((item) => (
          <div
            key={item.id}
            className={`shrink-0 w-[calc(100%-1rem)] md:w-[calc(50%-1rem)] xl:w-[calc(50%-1.5rem)] max-w-[34rem] snap-center flex select-none [&_img]:pointer-events-none ${loading ? "opacity-50" : "opacity-100"}`}
            onClickCapture={handleLinkClick}
          >
            <EventCard
              event={item}
              headingTag="h3"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
