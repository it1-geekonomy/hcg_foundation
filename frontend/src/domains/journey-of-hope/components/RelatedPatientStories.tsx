"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { PatientStory } from "../constants/stories";
import PatientStoryCard from "./PatientStoryCard";

export function RelatedPatientStories({ stories }: { stories: PatientStory[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const clickedLinkRef = useRef<boolean>(false);

  if (stories.length === 0) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    clickedLinkRef.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    clickedLinkRef.current = true;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (clickedLinkRef.current) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant="body-9" as="h2" className="font-manrope font-medium text-[#161A1D]">
          Read More Stories
        </Typography>
        <Link
          href="/patient-stories"
          className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
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
        className={`mt-6 flex overflow-x-auto gap-4 sm:gap-6 md:gap-7 no-scrollbar pb-4 sm:pb-0 touch-pan-y ${isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"}`}
      >
        {stories.map((relStory) => (
          <PatientStoryCard
            key={relStory.id}
            story={relStory}
            onClick={handleLinkClick}
            className="shrink-0 w-[280px] sm:w-[320px] md:w-[350px] lg:w-[385px] snap-center select-none"
          />
        ))}
      </div>
    </div>
  );
}
