"use client";

import React, { useState, useEffect } from "react";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function EventsListSection({ previewEvent }: { previewEvent?: EventItem | null }) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("events_current_page");
      if (savedPage) {
        const p = parseInt(savedPage, 10);
        if (!isNaN(p) && p > 0) return p;
      }
    }
    return 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Responsive itemsPerPage
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Fetch events page
  useEffect(() => {
    if (itemsPerPage === null) return;
    let cancelled = false;

    if (allEvents.length === 0) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }

    setError(null);
    (async () => {
      try {
        const res = await publicEventsApi.listPublished({
          page: currentPage,
          limit: itemsPerPage,
        });
        if (cancelled) return;

        if (res.data && res.data.length > 0) {
          const mapped: EventItem[] = res.data.map((e) => ({
            id: e.id ?? "",
            slug: e.slug ?? "",
            title: e.title ?? "",
            date: e.eventDate
              ? new Date(e.eventDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "",
            category: "Community Event",
            summary: e.shortDescription ?? "",
            fullStory: e.content ?? "",
            imageUrl: e.eventBanner || e.eventMobileBanner || "",
            mobileImageUrl: e.eventMobileBanner || e.eventBanner || "",
            location: e.eventLocation ?? "",
          }));

          let finalEvents = mapped;
          if (previewEvent) {
            // Remove the live version of this event if it exists in the fetched list
            finalEvents = finalEvents.filter(e => e.id !== previewEvent.id);
            // If we are on page 1, inject the preview event at the top
            if (currentPage === 1) {
              finalEvents = [previewEvent, ...finalEvents].slice(0, itemsPerPage);
            }
          }

          setAllEvents(finalEvents);
          setTotalCount(res.meta.total);
        } else {
          setAllEvents(previewEvent && currentPage === 1 ? [previewEvent] : []);
          setTotalCount(previewEvent ? 1 : 0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setAllEvents(previewEvent && currentPage === 1 ? [previewEvent] : []);
          setTotalCount(previewEvent ? 1 : 0);
          setError(err.message || "Failed to load events.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, itemsPerPage, previewEvent]);

  // Scroll restoration when coming back from event details
  useEffect(() => {
    if (!loading && allEvents.length > 0) {
      const savedScroll = sessionStorage.getItem("events_page_scroll");
      if (savedScroll) {
        sessionStorage.removeItem("events_page_scroll");
        const top = parseInt(savedScroll, 10);
        if (!isNaN(top)) {
          requestAnimationFrame(() => {
            window.scrollTo({ top, behavior: "instant" });
          });
        }
      }
    }
  }, [loading, allEvents]);

  const totalItems = totalCount ?? (previewEvent ? 1 : 0);
  const itemsPerPg = itemsPerPage || 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPg));
  const safePage = Math.min(currentPage, totalPages);

  const currentEvents = allEvents;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("events_current_page", String(page));
    }
  };

  return (
    <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
      <div className="w-full">
        <div
          key={`${safePage}-${itemsPerPage}`}
          className={`flex flex-col gap-16 pb-24 lg:pb-0 lg:grid lg:grid-cols-2 lg:gap-x-[2.5rem] lg:gap-y-[2.5rem] max-w-[80rem] mx-auto transition-all duration-500 ease-in-out ${isFetching ? "opacity-40 scale-[0.98] blur-[1px] pointer-events-none" : "opacity-100 scale-100 blur-0"
            }`}
        >
          {currentEvents.map((eventItem, itemIdx) => (
            <div
              key={`${eventItem.id}-${itemIdx}`}
              className="sticky top-[var(--mobile-top)] lg:top-auto lg:relative w-full"
              style={
                {
                  "--mobile-top": `calc(6rem + ${itemIdx * 1.5}rem)`,
                  zIndex: itemIdx,
                } as React.CSSProperties
              }
            >
              <EventCard
                event={eventItem}
                headingTag="h2"
                className="w-full shadow-2xl shadow-black/10 lg:shadow-xs transition-all duration-500"
              />
            </div>
          ))}
        </div>

        {!loading && !error && currentEvents.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            No events available at the moment.
          </div>
        )}
        {error && (
          <div className="py-12 text-center text-red-500">
            {error}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-12 sm:mt-16"
          showArrows={true}
          showNumbers={true}
        />
      )}
    </section>
  );
}
