"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  communityContent,
  communityTagRows,
  communityTheme,
} from "@/domains/home/constants/community";

/*
 * Glass overlay card on the image: light blackish, transparent, frosted (all devices).
 * Colour and blur are plain inline styles (prefixed + unprefixed) because Safari only
 * honours `-webkit-backdrop-filter` and can mis-render Tailwind's color-mix() opacity
 * colours. translateZ(0) gives the card its own layer so the blur still paints while
 * it fades/scales in.
 */
const glassStyle: React.CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.28)",
  WebkitBackdropFilter: "blur(12px)",
  backdropFilter: "blur(12px)",
  borderColor: "rgba(255, 255, 255, 0.18)",
  transform: "translateZ(0)",
};

export default function CommunitySection() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Existing overlay-card observer (unchanged)
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToDonateForm = () => {
    document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full px-6 pt-8 sm:px-10 md:px-14 lg:px-16 lg:py-16 xl:px-24 2xl:px-32">
      <div className="mx-auto max-w-[1400px]">
        {/* Tags left · heading + body right · vertically centered (Figma) */}
        <div className="mb-10 flex flex-col gap-8 overflow-x-clip md:mb-14 lg:mb-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-20">
          {/* Pills.
              Below 640px the row wrappers use `contents`, so all pills
              flow as one naturally wrapping list. */}
          <div
            className="order-2 flex flex-col gap-2 max-sm:flex-row max-sm:flex-wrap md:gap-5 lg:order-1 lg:max-w-[min(100%,32rem)] lg:shrink-0"
          >
            {communityTagRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-wrap gap-2 max-sm:contents md:gap-3"
              >
                {row.map((tag) => (
                  <Typography
                    key={tag}
                    variant="label-2"
                    as="span"
                    className="rounded-xs px-3 py-1.5 text-center font-manrope font-normal whitespace-nowrap md:px-4 md:py-2"
                    style={{
                      backgroundColor: communityTheme.tagBg,
                      color: communityTheme.tagText,
                    }}
                  >
                    {tag}
                  </Typography>
                ))}
              </div>
            ))}
          </div>

          {/* Text */}
          <div
            className="order-1 max-w-4xl font-tiempos-text lg:order-2 lg:text-left"
          >
            <Typography variant="heading-2" as="h2" className="text-[#382E07] font-medium">
              {communityContent.heading}
            </Typography>
            <Typography
              variant="body-2"
              as="p"
              className="mt-3 font-light font-argestadisplay text-[#2D2300C2] md:mt-4"
            >
              {communityContent.description}
            </Typography>
          </div>
        </div>

        <div
          ref={mediaRef}
          className="relative w-full h-[500px] md:h-auto md:aspect-[16/8] overflow-hidden rounded"
        >
          <Image
            src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790769497613-k9y7g-frame-653-1-.webp"
            alt={communityContent.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-top block md:hidden"
          />

          <Image
            src={communityContent.image.src}
            alt={communityContent.image.alt}
            fill
            sizes="100vw"
            className="hidden object-cover object-center md:block"
          />

          <div
            style={glassStyle}
            className={`absolute bottom-4 left-4 right-4 w-auto max-w-none rounded-xl border border-white/10 p-4 transition-all duration-700 ease-out md:bottom-8 md:left-8 md:right-auto md:max-w-xs lg:bottom-12 lg:max-w-lg lg:p-6 xl:bottom-20 xl:max-w-lg xl:p-6 ${inView
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-95 opacity-0"
              }`}
          >
            <div className="mb-2 flex items-center gap-2 md:mb-3 lg:mb-16">
              <span className="h-3 w-3 rounded-full bg-white" />
              <Typography
                variant="body-3"
                as="span"
                className="font-argestadisplay font-light text-white"
              >
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography
              variant="heading-6"
              as="h3"
              className="mb-2 font-tiempos-fine font-normal text-white md:mb-3 lg:mb-6"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography
              variant="body-7"
              as="p"
              className="mb-4 font-argestadisplay font-light text-white md:mb-5 lg:mb-6"
            >
              {communityContent.overlay.description}
            </Typography>

            <button
              type="button"
              onClick={scrollToDonateForm}
              className="inline-flex items-center gap-1.5 bg-[#FCCC2D] px-2.5 py-1.5 transition-colors hover:bg-[#e0b410] sm:gap-2 sm:px-3 sm:py-2 lg:gap-2 lg:px-6 lg:py-3"
            >
              {/* < lg: same type as the About CTA */}
              <Typography
                variant="button-3"
                as="span"
                className="font-manrope font-semibold text-[#373737] lg:hidden"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              {/* lg+: original */}
              <Typography
                variant="button-1"
                as="span"
                className="hidden font-manrope font-medium text-[#373737] lg:block"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              <ArrowUpRight
                className="h-3 w-3 text-[#373737] sm:h-3.5 sm:w-3.5 lg:h-5 lg:w-5"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}