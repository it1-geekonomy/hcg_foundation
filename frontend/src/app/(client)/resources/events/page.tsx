"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EVENTS_DATA } from "@/domains/resources/constants/events";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

const CARDS_PER_PAGE = 2;

export default function EventsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Group events into pages of CARDS_PER_PAGE (1 row x 2 columns = 2 cards)
  const totalPages = Math.ceil(EVENTS_DATA.length / CARDS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const start = pageIndex * CARDS_PER_PAGE;
    if (start + CARDS_PER_PAGE > EVENTS_DATA.length && EVENTS_DATA.length >= CARDS_PER_PAGE) {
      return EVENTS_DATA.slice(-CARDS_PER_PAGE);
    }
    return EVENTS_DATA.slice(start, start + CARDS_PER_PAGE);
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
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
        {/* Smooth Horizontal Sliding Track matching Projects */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
          >
            {pages.map((pageEvents, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem]"
              >
                {pageEvents.map((eventItem) => (
                  <EventCard
                    key={`${pageIdx}-${eventItem.id}`}
                    event={eventItem}
                    headingTag="h2"
                  />
                ))}
              </div>
            ))}
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
