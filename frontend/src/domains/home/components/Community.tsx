"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { communityTags, communityContent } from "@/domains/home/constants/community";

// Used only for the sm+ two-row layout; mobile wraps naturally on its own.
const tagRows = [communityTags.slice(0, 3), communityTags.slice(3, 6)];

export default function CommunitySection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#FFE380] to-[#FFF6D8] py-14 sm:py-20 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top: Tags + Heading/Description */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 mb-10 sm:mb-14">
          {/* Tags — below sm: natural wrap; sm and up: fixed 3+3 rows */}
          <div className="lg:w-auto shrink-0">
            {/* Mobile: natural flex-wrap */}
            <div className="flex sm:hidden flex-wrap gap-2">
              {communityTags.map((tag, i) => (
                <Typography
                  variant="body-sm"
                  as="span"
                  key={i}
                  className="px-3 py-1.5 bg-[#876900] text-[#FFFFFF] font-medium font-manrope text-center whitespace-nowrap"
                >
                  {tag}
                </Typography>
              ))}
            </div>

            {/* sm and up: two independent rows, each content-sized */}
            <div className="hidden sm:flex flex-col gap-2 sm:gap-3">
              {tagRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 sm:gap-3">
                  {row.map((tag, i) => (
                    <Typography
                      variant="body-sm"
                      as="span"
                      key={i}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#876900] text-[#FFFFFF] font-medium font-manrope text-center whitespace-nowrap"
                    >
                      {tag}
                    </Typography>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Heading + description */}
          <div className="max-w-xl lg:text-left">
            <Typography
              variant="editorial-lg"
              as="h2"
              className="font-tiempos-headline font-normal text-[#382E07]"
            >
              {communityContent.heading}
            </Typography>
            <Typography
              variant="subheading"
              as="p"
              className="font-argestadisplay font-normal text-[#2D2300] mt-3 sm:mt-4"
            >
              {communityContent.description}
            </Typography>
          </div>
        </div>

        {/* Image with overlay card */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] overflow-hidden">
          <Image
            src={communityContent.image.src}
            alt={communityContent.image.alt}
            fill
            className="object-cover"
            priority
          />

          {/* Overlay card */}
          <div className="absolute left-4 bottom-4 sm:left-8 sm:bottom-8 max-w-xs sm:max-w-sm bg-black/50 backdrop-blur-sm rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-3 h-3 rounded-full bg-[#FFFFFF]" />
              <Typography
                variant="body-lg"
                as="span"
                className="text-white font-argestadisplay"
              >
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography
              variant="editorial-sm"
              as="h3"
              className="font-tiempos-headline font-normal text-white mb-2 sm:mb-3"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography
              variant="body"
              as="p"
              className="text-white font-argestadisplay mb-4 sm:mb-5"
            >
              {communityContent.overlay.description}
            </Typography>

            <button className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-[#FCCC2D] hover:bg-[#e0b410] transition-colors">
              <Typography
                variant="body"
                as="span"
                className="font-manrope font-semibold text-[#373737]"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              <ArrowUpRight className="h-5 w-5 text-[#373737]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}