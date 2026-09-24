"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] xl:max-w-[102rem] 2xl:max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8";

function chunkIntoPages<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [];
  if (items.length <= pageSize) return [items];

  const totalPages = Math.ceil(items.length / pageSize);
  const result: T[][] = [];

  for (let i = 0; i < totalPages; i++) {
    if (i === totalPages - 1) {
      // Last page: always take the last `pageSize` items so 3 rows x 2 cols is completely filled and never left empty!
      result.push(items.slice(-pageSize));
    } else {
      result.push(items.slice(i * pageSize, (i + 1) * pageSize));
    }
  }

  return result;
}

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [loading, setLoading] = useState(true);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  // Responsive itemsPerPage: 3 on desktop (1 row x 3 columns), 2 on tablet, 1 on mobile
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Fetch all published events once so smooth horizontal sliding works instantly with 0 latency
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await publicEventsApi.listPublished({
          limit: 100,
        });
        if (!cancelled) {
          const mapped: EventItem[] = (res.data ?? []).map((e) => ({
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
            imageUrl:
              e.eventBanner ||
              e.eventMobileBanner ||
              "/Resources/Resources banner image.png",
            mobileImageUrl:
              e.eventMobileBanner ||
              e.eventBanner ||
              "/Resources/Resources banner image.png",
            location: e.eventLocation ?? "",
          }));
          setAllEvents(mapped);
        }
      } catch (err) {
        if (!cancelled) setAllEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute pages with full items (last page is never left empty!)
  const pages = useMemo(() => {
    return chunkIntoPages(allEvents, itemsPerPage);
  }, [allEvents, itemsPerPage]);

  const totalPages = Math.max(1, pages.length);
  const safePage = Math.min(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50 && safePage < totalPages) {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    } else if (diff < -50 && safePage > 1) {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
    touchStartXRef.current = null;
  };

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/#events" },
          { label: "Resources" },
        ]}
        title="Events"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Smooth Horizontal Sliding Track */}
        <div
          className="overflow-hidden w-full touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${(safePage - 1) * 100}%)` }}
          >
            {pages.map((pageItems, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[1.25rem] lg:gap-x-[1.5rem] gap-y-[1.5rem] sm:gap-y-[2rem] lg:gap-y-[2.5rem]"
              >
                {pageItems.map((eventItem, itemIdx) => (
                  <EventCard
                    key={`${eventItem.id}-${pageIdx}-${itemIdx}`}
                    event={eventItem}
                    headingTag="h2"
                  />
                ))}
              </div>
            ))}
          </div>

          {!loading && allEvents.length === 0 && (
            <div className="py-12 text-center text-neutral-500">
              No events available at the moment.
            </div>
          )}
        </div>

        {/* Bottom Centered Pagination Navigation matching Patient Stories */}
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

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
