"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

const CARDS_PER_PAGE = 2;

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicEventsApi.listPublished({
          page: currentPage,
          limit: CARDS_PER_PAGE,
        });
        if (!cancelled) {
          const mapped: EventItem[] = (res.data ?? []).map((e) => ({
            id: e.id ?? "",
            slug: e.slug ?? "",
            title: e.title ?? "",
            date: e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Community Event",
            summary: e.shortDescription ?? "",
            fullStory: e.content ?? "",
            imageUrl: e.eventBanner || e.eventMobileBanner || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
            location: e.eventLocation ?? "",
          }));
          setEvents(mapped);
          setTotalPages(res.meta?.totalPages ?? 1);
        }
      } catch (err) {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // The API directly returns the correct page of items, so we just use `events`
  const pages = [events];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
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
        {/* Smooth Horizontal Sliding Track matching Projects */}
        <div className="overflow-hidden w-full">
          <div className={`flex transition-opacity duration-500 ease-in-out ${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem]">
              {events.map((eventItem) => (
                <EventCard
                  key={eventItem.id}
                  event={eventItem}
                  headingTag="h2"
                />
              ))}
              {!loading && events.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-500">
                  No events available at the moment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Centered Pagination Navigation Dots Only */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-[2rem] sm:mt-[2.5rem]"
          showArrows={false}
          showDots={true}
        />
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
