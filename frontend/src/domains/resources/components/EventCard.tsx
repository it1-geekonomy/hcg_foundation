"use client";

import React from "react";
import Link from "next/link";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import type { EventItem } from "@/domains/resources/constants/events";

interface EventCardProps {
  event: EventItem;
  headingTag?: "h2" | "h3";
  className?: string;
  aspectRatio?: string;
}

export default function EventCard({
  event,
  headingTag = "h2",
  className = "",
  aspectRatio,
}: EventCardProps) {
  const cardAspectRatio =
    aspectRatio ||
    "aspect-[1/1] min-[450px]:aspect-[788/454] sm:aspect-[530.16/374.62] lg:aspect-[530.16/374.62] xl:aspect-[530.16/374.62] 2xl:aspect-[530.16/374.62]";

  return (
    <Link
      href={`/resources/events/${event.slug || event.id}`}
      className={`group relative block ${cardAspectRatio} w-full overflow-hidden rounded-[0.75rem] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
    >
      <picture className="h-full w-full block">
        {event.mobileImageUrl && (
          <source media="(max-width: 767px)" srcSet={event.mobileImageUrl} />
        )}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </picture>

      {/* Floating Glassmorphic Overlay matching Figma Frame 811 (Left 13px, Right 14px, Bottom 18px) */}
      <div className="absolute left-[0.5rem] right-[0.5rem] bottom-[0.5rem] sm:left-[0.8125rem] sm:right-[0.875rem] sm:bottom-[1.125rem] flex items-center justify-between gap-[0.625rem] sm:gap-[0.75rem] px-[0.75rem] py-[0.625rem] sm:px-[1rem] sm:py-[0.75rem] rounded-[0.5rem] sm:rounded-[0.625rem] border border-white/20 bg-[#8D8D8D]/40 backdrop-blur-md text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
        {/* Left: Title + Date stacked */}
        <div className="flex flex-col justify-center min-w-0 text-left gap-[0.25rem]">
          <div className="drop-shadow-xs text-left">
            <Typography
              variant="body-2"
              as={headingTag}
              title={event.title}
              className="text-left text-white block truncate [text-wrap:balance]"
            >
              {event.title}
            </Typography>
          </div>
          <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] min-w-0 text-left">
            <img
              src="/Resources/calendar.png"
              alt="Calendar"
              className="size-[0.8125rem] sm:size-[1rem] shrink-0 object-contain"
            />
            <div className="text-left truncate">
              <Typography variant="body-8" as="span" className="text-white truncate">
                Event Date: {event.date}
              </Typography>
            </div>
          </div>
        </div>

        {/* Right: Read More Button */}
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center justify-center whitespace-nowrap h-[2.125rem] sm:h-[2.375rem] px-[0.875rem] sm:px-[1rem] gap-[0.35rem] sm:gap-[0.5rem] rounded-[0.25rem] sm:rounded-[0.3125rem] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs cursor-pointer shrink-0 transition duration-300 group-hover:bg-[#E9B510]">
            <Typography variant="button-3" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1.25rem] h-[1rem] sm:w-[1.375rem] sm:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
