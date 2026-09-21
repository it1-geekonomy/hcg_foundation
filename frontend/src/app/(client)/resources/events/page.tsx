"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import EventCard from "@/domains/resources/components/EventCard";
import { EVENTS_DATA } from "@/domains/resources/constants/events";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function EventsPage() {
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

  const maxIndex = Math.max(0, EVENTS_DATA.length - visibleCount);
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
        {/* Animated Horizontal Sliding Track matching Figma Frame 35 */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-out gap-6 lg:gap-8"
            style={{ transform: getTransformStyle() }}
          >
            {EVENTS_DATA.map((eventItem) => (
              <div
                key={eventItem.id}
                className="shrink-0 w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
              >
                <EventCard event={eventItem} headingTag="h2" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Centered Pagination Navigation Controls */}
        <PaginationControls
          currentPage={safeIndex + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentIndex(page - 1)}
          className="mt-8 sm:mt-10"
        />
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
