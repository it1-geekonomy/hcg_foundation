"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import { awards } from "@/domains/about/constants/awards";

export interface AwardsRecognitionProps {
  /** Override the section background color/class if needed */
  className?: string;
}

export default function AwardsRecognition({ className = "" }: AwardsRecognitionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstImageRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [arrowTop, setArrowTop] = useState<number | null>(null);
  const [titleHeight, setTitleHeight] = useState<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const updateArrowPosition = useCallback(() => {
    const imageEl = firstImageRef.current;
    if (!imageEl) return;
    setArrowTop(imageEl.offsetHeight / 2);
  }, []);

  const updateTitleHeight = useCallback(() => {
    const heights = titleRefs.current.map((el) => el?.offsetHeight ?? 0);
    const max = heights.length ? Math.max(...heights) : 0;
    setTitleHeight(max || null);
  }, []);

  useEffect(() => {
    updateScrollState();
    updateArrowPosition();
    updateTitleHeight();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      updateScrollState();
      updateArrowPosition();
      updateTitleHeight();
    };
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateScrollState, updateArrowPosition, updateTitleHeight]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-award-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const showArrows = canScrollLeft || canScrollRight;
  const arrowStyle = arrowTop !== null ? { top: `${arrowTop}px` } : undefined;

  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFFCF2] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <Typography
        variant="heading-2"
        as="h2"
        className="font-tiempos-headline text-[#382E07]"
      >
        Awards & Recognition
      </Typography>

      <Typography
        variant="body-2"
        as="p"
        className="mt-6 max-w-4xl font-normal font-argestadisplay text-[#293239]"
      >
        These recognitions reflect the support of our partners, well-wishers and communities,
        and inspire us to continue working towards equitable cancer care for all.
      </Typography>

      <div className="relative mt-10">
        {showArrows && (
          <button
            type="button"
            aria-label="Scroll to previous award"
            onClick={() => scrollByCard("left")}
            disabled={!canScrollLeft}
            style={arrowStyle}
            className={`absolute -left-4 sm:-left-6 lg:-left-10 top-1/3 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center transition-opacity ${
              canScrollLeft ? "opacity-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="#382E07"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {showArrows && (
          <button
            type="button"
            aria-label="Scroll to next award"
            onClick={() => scrollByCard("right")}
            disabled={!canScrollRight}
            style={arrowStyle}
            className={`absolute -right-4 sm:-right-6 lg:-right-10 top-1/3 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center transition-opacity ${
              canScrollRight ? "opacity-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke="#382E07"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {awards.map((award, index) => (
            <div
              key={index}
              data-award-card
              className="min-w-0 flex-none basis-full snap-start sm:basis-[calc(50%-12px)] lg:basis-[calc(50%-12px)]"
            >
              <div
                ref={index === 0 ? firstImageRef : undefined}
                className="relative aspect-[4/5] w-full overflow-hidden"
              >
                <Image
                  src={award.image}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              <div className="w-full min-w-0">
                <div
                  className="mt-4 flex items-start justify-center overflow-hidden"
                  style={titleHeight !== null ? { height: `${titleHeight}px` } : undefined}
                >
                  <div ref={(el) => { titleRefs.current[index] = el; }}>
                    <Typography
                      variant="heading-9"
                      as="h3"
                      className="text-center font-argestadisplay text-[#000910] break-words"
                    >
                      {award.title}
                    </Typography>
                  </div>
                </div>

                <Typography
                  variant="body-9"
                  as="p"
                  className="mt-4 sm:mt-8 text-center font-normal font-manrope text-[#293239] break-words"
                >
                  {award.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}