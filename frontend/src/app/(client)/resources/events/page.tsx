"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
          setTotalCount(res.meta.total);
        } else {
          setAllEvents([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setAllEvents([]);
          setTotalCount(0);
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
  }, [currentPage, itemsPerPage]);

  const totalItems = totalCount ?? 0;
  const itemsPerPg = itemsPerPage || 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPg));
  const safePage = Math.min(currentPage, totalPages);
  
  const currentEvents = allEvents;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
        title="Events"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="w-full">
          <div
            key={`${safePage}-${itemsPerPage}`}
            className={`flex flex-col gap-16 pb-24 lg:pb-0 lg:grid lg:grid-cols-2 lg:gap-x-[2rem] lg:gap-y-[2.5rem] transition-all duration-500 ease-in-out ${
              isFetching ? "opacity-40 scale-[0.98] blur-[1px] pointer-events-none" : "opacity-100 scale-100 blur-0"
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
