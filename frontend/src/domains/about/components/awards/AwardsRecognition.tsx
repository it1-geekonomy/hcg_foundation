"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import type { AwardItem } from "@/domains/about/constants/awards";
import { AwardCard } from "./AwardCard";

export interface AwardsRecognitionProps {
  items: AwardItem[];
  className?: string;
  hideIntro?: boolean;
}

function awardKey(award: AwardItem, index: number) {
  return award.id ?? `${award.title}-${index}`;
}

export default function AwardsRecognition({
  items,
  className = "",
  hideIntro = false,
}: AwardsRecognitionProps) {
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
    titleRefs.current = titleRefs.current.slice(0, items.length);
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
  }, [items, updateScrollState, updateArrowPosition, updateTitleHeight]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-award-card]");
    const gap = parseFloat(window.getComputedStyle(el).columnGap || "24") || 24;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  const showArrows = canScrollLeft || canScrollRight;
  const arrowStyle = arrowTop !== null ? { top: `${arrowTop}px` } : undefined;

  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      {!hideIntro ? (
        <>
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
            className="mt-6 max-w-4xl font-argestadisplay font-normal text-[#293239]"
          >
            These recognitions reflect the support of our partners, well-wishers
            and communities, and inspire us to continue working towards equitable
            cancer care for all.
          </Typography>
        </>
      ) : null}

      <div className={hideIntro ? "relative" : "relative mt-10"}>
        {showArrows ? (
          <>
            <button
              type="button"
              aria-label="Scroll to previous award"
              onClick={() => scrollByCard("left")}
              disabled={!canScrollLeft}
              style={arrowStyle}
              className={`absolute -left-4 top-1/3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition-opacity sm:-left-6 lg:-left-10 ${
                canScrollLeft
                  ? "cursor-pointer opacity-100"
                  : "cursor-not-allowed opacity-40"
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
            <button
              type="button"
              aria-label="Scroll to next award"
              onClick={() => scrollByCard("right")}
              disabled={!canScrollRight}
              style={arrowStyle}
              className={`absolute -right-4 top-1/3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition-opacity sm:-right-6 lg:-right-10 ${
                canScrollRight
                  ? "cursor-pointer opacity-100"
                  : "cursor-not-allowed opacity-40"
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
          </>
        ) : null}

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] lg:gap-12 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((award, index) => (
            <div
              key={awardKey(award, index)}
              className="min-w-0 flex-none basis-full snap-start sm:basis-[calc(50%-12px)] lg:basis-[calc(50%-24px)]"
            >
              <AwardCard
                award={award}
                titleHeight={titleHeight}
                titleRef={(el) => {
                  titleRefs.current[index] = el;
                }}
                imageRef={
                  index === 0
                    ? (el) => {
                        firstImageRef.current = el;
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
