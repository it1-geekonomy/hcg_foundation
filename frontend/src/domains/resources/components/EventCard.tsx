"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageProps } from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
export interface EventItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: "Celebration" | "Community Event" | "Wellness" | "Awareness";
  summary: string;
  fullStory: string;
  imageUrl: string;
  mobileImageUrl?: string;
  location?: string;
}

interface EventCardProps {
  event: EventItem;
  headingTag?: "h2" | "h3";
  className?: string;
}

export default function EventCard({
  event,
  headingTag = "h2",
  className = "",
}: EventCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const detailUrl = `/events/${event.slug || event.id}`;

  const handleCardClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("events_page_scroll", String(window.scrollY));
      sessionStorage.setItem("came_from_details_type", "events_listing");
    }
  };

  const validImageUrl = event.imageUrl && event.imageUrl !== "null" ? event.imageUrl : null;
  const validMobileUrl = event.mobileImageUrl && event.mobileImageUrl !== "null" ? event.mobileImageUrl : null;

  const desktopProps = validImageUrl
    ? getImageProps({
        src: validImageUrl,
        alt: event.title,
        fill: true,
        sizes: "(min-width: 768px) 500px, 100vw",
        className: "object-cover transition duration-700 group-hover:scale-105",
      }).props
    : null;

  const mobileProps = validMobileUrl
    ? getImageProps({
        src: validMobileUrl,
        alt: event.title,
        fill: true,
        sizes: "100vw",
        className: "object-cover transition duration-700 group-hover:scale-105",
      }).props
    : null;

  const frontContent = (
    <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-[#EFEAD8] shadow-xs transition duration-300">
      {validImageUrl && desktopProps ? (
        <>
          <picture className="h-full w-full block">
            {event.mobileImageUrl && mobileProps && (
              <source media="(max-width: 767px)" srcSet={mobileProps.srcSet} />
            )}
            <img {...desktopProps} />
          </picture>

          {/* Linear Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
        </>
      ) : null}

      {/* Floating Glassmorphic Overlay */}
      <div
        data-no-flip="true"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="absolute left-[0.75rem] right-[0.75rem] bottom-[0.75rem] xl:left-[1.1rem] xl:right-[1.28rem] xl:bottom-[1.51rem] flex flex-col justify-center gap-[0.5rem] p-[1rem] lg:py-[1.25rem] lg:px-[1.5rem] xl:pl-[1.74rem] xl:pr-[2rem] rounded-[6px] border border-white/10 bg-[#838383]/40 backdrop-blur-[55px] text-white transition duration-300 group-hover:bg-[#838383]/50 cursor-pointer"
      >
        {/* Title + Date stacked full width */}
        <div className="w-full text-left">
          <Typography
            variant="heading-8"
            as={headingTag}
            title={event.title}
            className="font-argestadisplay font-normal text-white block w-full !leading-[1.15]"
            dangerouslySetInnerHTML={{ __html: event.title }}
          />
        </div>
        {event.date && event.date.trim() ? (
          <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] xl:gap-[0.7rem] min-w-0 text-left pt-1">
            <img
              src="/Resources/calendar.png"
              alt="Calendar"
              className="size-[0.875rem] sm:size-[1.15rem] xl:size-[1.39rem] shrink-0 object-contain"
            />
            <div className="text-left min-w-0 overflow-hidden">
              <Typography variant="body-8" as="span" className="text-white block truncate">
                Event Date: {event.date}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div className="relative h-full w-full flex flex-col justify-between items-center p-4 sm:p-5 lg:p-6 rounded-[6px] border border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2]">
        {/* Scrollable Story Description matching Patient Stories pattern */}
        <div className="min-h-0 flex-1 w-full overflow-y-auto pr-1.5 space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {event.summary ? (
            event.summary
              .split("\n\n")
              .map((paragraph, idx) => (
                <Typography
                  key={idx}
                  variant="body-2"
                  as="p"
                  className="font-manrope leading-relaxed font-normal text-[#0D2838] text-left"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))
          ) : null}
        </div>

        {/* Read More Button Constant at Bottom Center */}
        <div className="relative z-10 w-full flex justify-center shrink-0 pt-3 border-t border-[#E0D4AE]/50 mt-2">
          <Link
            href={detailUrl}
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof window !== "undefined") {
                sessionStorage.setItem("events_page_scroll", String(window.scrollY));
                sessionStorage.setItem("came_from_details_type", "events_listing");
              }
            }}
            className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[6px] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </Link>
        </div>
      </div>
    </MirrorReveal>
  );

  return (
    <Link 
      href={detailUrl} 
      onClick={handleCardClick}
      className={`block w-full max-w-[38rem] mx-auto aspect-[4/3.5] sm:aspect-[16/11] xl:aspect-[16/11] ${className}`}
      aria-label={`View details for ${event.title}`}
    >
      <FlipCard
        className="h-full w-full"
        roundedClassName="rounded-[0.375rem]"
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
        flipOnHover={true}
        duration={0.42}
        front={frontContent}
        back={renderBackContent}
      />
    </Link>
  );
}
