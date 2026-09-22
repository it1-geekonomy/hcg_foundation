"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import type { EventItem } from "@/domains/resources/constants/events";

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
  return (
    <Link
      href={`/resources/events/${event.slug || event.id}`}
      className={`group relative block aspect-[788/454] w-full overflow-hidden rounded-[0.375rem] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
    >
      <img
        src={event.imageUrl}
        alt={event.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Glassmorphic Overlay matching Figma Frame 9 & 10 */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-[0.58rem] pl-[1.1rem] pr-[1.28rem] pb-[1.16rem] pt-[1.16rem] border-t border-white/10 bg-[#8D8D8D]/40 backdrop-blur-md text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[0.38rem] text-left">
          <div className="truncate drop-shadow-xs text-left">
            <Typography
              variant="body-2"
              as={headingTag}
              className="font-argestadisplay font-normal text-left text-white block truncate"
            >
              {event.title}
            </Typography>
          </div>

          <div className="flex items-center gap-[0.5rem] min-w-0 text-left">
            <Calendar className="size-[1rem] text-white shrink-0" />
            <div className="truncate text-left">
              <Typography variant="body-8" as="span" className="font-manrope font-medium text-white">
                Event Date: {event.date}
              </Typography>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <span className="flex items-center justify-between whitespace-nowrap w-[11rem] h-[3.5625rem] pl-[1.1rem] pr-[0.58rem] py-[0.58rem] gap-[0.58rem] rounded-[0.375rem] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105 cursor-pointer">
            <Typography variant="button-3" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <ArrowUpRight className="w-[1.29rem] h-[1.03rem] text-[#2D2D2D] shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
