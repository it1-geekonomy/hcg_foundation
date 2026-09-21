"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import { PatientStory } from "../constants/stories";

export function RelatedPatientStories({ stories }: { stories: PatientStory[] }) {
  const [columns, setColumns] = useState<number>(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumns(4);
      } else if (width >= 768) {
        setColumns(3);
      } else if (width >= 640) {
        setColumns(2);
      } else {
        setColumns(2);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const visibleStories = stories.slice(0, columns);

  if (visibleStories.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant="body-9" as="h2" className="font-manrope font-medium text-[#161A1D]">
          Read More Stories
        </Typography>
        <Link
          href="/journey-of-hope/patient-stories"
          className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
        >
          <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
            View All
          </Typography>
          <ArrowUpRight className="size-4 text-[#2D2D2D]" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
        {visibleStories.map((relStory) => (
          <Link
            key={relStory.id}
            href={`/journey-of-hope/patient-stories/${relStory.id}`}
            className="group relative flex flex-col justify-between aspect-[385/493] w-full overflow-hidden rounded-[1.375rem] border border-white/50 bg-[#EFEAD8] p-[1.1rem] sm:p-[1.35rem] pb-0 sm:pb-0 shadow-sm transition duration-300 hover:shadow-md hover:border-white/70"
          >
            {/* 1. Full-bleed background photo (Figma SHADETT layer: blurred 0.75rem to let natural colors bleed through) */}
            <img
              src={relStory.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover scale-110 filter blur-[0.75rem] opacity-90 transition duration-500 group-hover:scale-115"
            />

            {/* 2. Soft translucent glass tint over outer card matching Figma Subtract fill */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition duration-300 group-hover:bg-white/25" />

            {/* 3. Inner Card matching Figma Rectangle 31 (339x368, Radius: 1.25rem) */}
            <div className="relative z-10 w-full aspect-[339/368] overflow-hidden rounded-[1.25rem] shadow-xs">
              <img
                src={relStory.imageUrl}
                alt={relStory.patientName}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* 4. Bottom Info Bar matching Figma Frame 97 (Height: 6.375rem): Name & Date (Left) + Circular Arrow Button (Right) */}
            <div className="relative z-10 h-[5.5rem] sm:h-[6.375rem] px-1 flex items-center justify-between gap-3">
              {/* Left: Patient Name & Date */}
              <div className="flex flex-col text-white min-w-0">
                <div className="truncate">
                  <Typography
                    variant="heading-8"
                    as="h3"
                    className="font-manrope font-bold text-white"
                  >
                    {relStory.patientName}
                  </Typography>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[#FFFFFF]">
                  <Calendar className="size-3.5 sm:size-4 text-[#FFFFFF] shrink-0" />
                  <Typography
                    variant="body-8"
                    as="span"
                    className="font-manrope font-medium text-[#FFFFFF]"
                  >
                    {relStory.date}
                  </Typography>
                </div>
              </div>

              {/* Right: Circular Arrow Button matching Figma */}
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1E1E1E] shadow-sm transition duration-300 group-hover:scale-110">
                <ArrowUpRight className="size-5 sm:size-5.5 text-[#1E1E1E]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
