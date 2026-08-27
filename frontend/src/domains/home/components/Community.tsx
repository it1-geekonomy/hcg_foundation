"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { communityTags, communityContent } from "@/domains/home/constants/community";

// Used for the two-row tag layout at every breakpoint.
const tagRows = [communityTags.slice(0, 3), communityTags.slice(3, 6)];

export default function CommunitySection() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    // No `disconnect()` here on purpose — toggling inView both ways
    // lets the animation replay on scroll down AND reverse on scroll up.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-14 md:py-20 px-4 md:px-10 lg:px-16 xl:px-30">
      <div className="max-w-full">
        {/* Top: Tags + Heading/Description — heading first on mobile, tags first (left column) on lg+ */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 mb-10 md:mb-14">
          {/* Tags — below sm: natural wrap; sm and up: fixed 3+3 rows */}
          <div className="order-2 lg:order-1 lg:w-auto shrink-0">
            {/* Mobile: natural flex-wrap */}
            <div className="flex sm:hidden flex-wrap gap-2">
              {communityTags.map((tag, i) => (
                <Typography
                  variant="body-lg"
                  as="span"
                  key={i}
                  className="px-3 py-1.5 bg-[#876900] text-[#FFFFFF] font-medium font-manrope text-center whitespace-nowrap"
                >
                  {tag}
                </Typography>
              ))}
            </div>

            {/* sm and up: fixed 3+3 rows */}
            <div className="hidden sm:flex flex-col gap-2 md:gap-3">
              {tagRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 md:gap-3">
                  {row.map((tag, i) => (
                    <Typography
                      variant="body-sm"
                      as="span"
                      key={i}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-[#876900] text-[#FFFFFF] font-medium font-manrope text-center whitespace-nowrap"
                    >
                      {tag}
                    </Typography>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Heading + description */}
          <div className="order-1 lg:order-2 max-w-4xl lg:text-left">
            <Typography
              variant="hero"
              as="h2"
              className="font-tiempos-headline font-normal text-[#382E07] !tracking-[0.1em]"
            >
              {communityContent.heading}
            </Typography>
            <Typography
              variant="subheading"
              as="p"
              className="font-argestadisplay font-normal text-[#2D2300] mt-3 md:mt-4"
            >
              {communityContent.description}
            </Typography>
          </div>
        </div>

        {/* Image with overlay card */}
        <div
          ref={mediaRef}
          className="relative w-full h-[500px] md:h-auto md:aspect-[16/8] overflow-hidden rounded"
        >
          {/* Mobile-only image, shown below 768px */}
          <Image
            src="/community/communitymobile.png"
            alt={communityContent.image.alt}
            fill
            className="object-cover object-top block md:hidden"
            priority
          />

          {/* Tablet/desktop image, shown at 768px and up */}
          <Image
            src={communityContent.image.src}
            alt={communityContent.image.alt}
            fill
            className="object-cover object-center hidden md:block"
            priority
          />

          {/* Overlay card — sits at the bottom of the image at every breakpoint, with the same slide/fade animation, reversible on scroll */}
          <div
            className={`absolute left-4 right-4 bottom-4 w-auto max-w-none p-4 md:left-8 md:right-auto md:top-auto md:bottom-8 md:max-w-xs lg:bottom-12 lg:max-w-md lg:p-10 xl:bottom-20 xl:max-w-lg xl:p-14 bg-white/[0.12] backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-700 ease-out ${
              inView
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-10"
            }`}
          >
            <div className="flex items-center gap-2 mb-2 md:mb-3 lg:mb-16">
              <span className="w-3 h-3 rounded-full bg-[#FFFFFF]" />
              <Typography
                variant="subheading"
                as="span"
                className="text-white font-argestadisplay font-normal"
              >
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography
              variant="editorial-xl"
              as="h3"
              className="font-tiempos-headline font-normal text-white mb-2 md:mb-3 lg:mb-6"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography
              variant="body-lg"
              as="p"
              className="text-white font-argestadisplay mb-4 md:mb-5 lg:mb-6 font-normal"
            >
              {communityContent.overlay.description}
            </Typography>

            <Link href="/#" className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 lg:py-3 bg-[#FCCC2D] hover:bg-[#e0b410] transition-colors">
              <Typography
                variant="body"
                as="span"
                className="font-manrope font-semibold text-[#373737]"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              <ArrowUpRight className="h-5 w-5 text-[#373737]" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}