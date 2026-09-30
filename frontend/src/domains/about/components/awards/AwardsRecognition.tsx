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

function AwardScrollArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      aria-label={isLeft ? "Scroll to previous award" : "Scroll to next award"}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-10 flex-none items-center justify-center transition-opacity ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer opacity-100"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={isLeft ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
          stroke="#382E07"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * Shared About Us awards section — used on the public site and in CMS preview.
 * Arrows are real flex siblings of the track (not absolutely positioned over
 * it), so they can never overlay the images; a 2px gap sits between them.
 * Below 640px the track's width is capped to match the visible card so the
 * arrows land right next to the image instead of at the far edges.
 * Dragging (mouse or touch) is handled manually via pointer events so it
 * always advances exactly one card per gesture, on every screen size.
 */
export default function AwardsRecognition({
  items,
  className = "",
  hideIntro = false,
}: AwardsRecognitionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [titleHeight, setTitleHeight] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const draggedDistanceRef = useRef(0);

  /* ---------- Text-only: intro slide-in (plays once) ---------- */
  const introRef = useRef<HTMLDivElement | null>(null);
  const [introVisible, setIntroVisible] = useState(false);

  useEffect(() => {
    if (hideIntro) return;
    const node = introRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIntroVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hideIntro]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const updateTitleHeight = useCallback(() => {
    const heights = titleRefs.current.map((el) => el?.offsetHeight ?? 0);
    const max = heights.length ? Math.max(...heights) : 0;
    setTitleHeight(max || null);
  }, []);

  const updateImageHeight = useCallback(() => {
    const el = trackRef.current?.querySelector<HTMLElement>("[data-award-image]");
    setImageHeight(el ? el.offsetHeight : null);
  }, []);

  useEffect(() => {
    titleRefs.current = titleRefs.current.slice(0, items.length);
    updateScrollState();
    updateTitleHeight();
    updateImageHeight();

    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      updateScrollState();
      updateTitleHeight();
      updateImageHeight();
    };
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items, updateScrollState, updateTitleHeight, updateImageHeight]);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    draggedDistanceRef.current = 0;
    dragStartXRef.current = e.clientX;
    trackRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    draggedDistanceRef.current = e.clientX - dragStartXRef.current;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture may already be released; safe to ignore
    }
    const distance = draggedDistanceRef.current;
    const threshold = 40;
    if (distance <= -threshold) {
      scrollByCard("right");
    } else if (distance >= threshold) {
      scrollByCard("left");
    }
    draggedDistanceRef.current = 0;
  };

  if (items.length === 0) return null;

  const showArrows = canScrollLeft || canScrollRight;
  const arrowRailStyle = imageHeight != null ? { height: `${imageHeight}px` } : undefined;

  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      {!hideIntro ? (
        <div ref={introRef}>
          <Typography
            variant="heading-2"
            as="h2"
            className={`font-tiempos-headline text-[#382E07] transition-all duration-[900ms] ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
              introVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-16 opacity-0"
            }`}
          >
            Awards & Recognition
          </Typography>
          <Typography
            variant="body-2"
            as="p"
            className={`mt-6 max-w-4xl font-argestadisplay font-normal text-[#293239] transition-all duration-[900ms] delay-150 ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
              introVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-16 opacity-0"
            }`}
          >
            These recognitions reflect the support of our partners, well-wishers
            and communities, and inspire us to continue working towards equitable
            cancer care for all.
          </Typography>
        </div>
      ) : null}

      <div className={hideIntro ? "relative" : "relative mt-10"}>
        <div className="mx-auto flex max-w-[1100px] items-start justify-center gap-[2px]">
          {showArrows ? (
            <div
              className="flex flex-none items-center justify-center"
              style={arrowRailStyle}
            >
              <AwardScrollArrow
                direction="left"
                disabled={!canScrollLeft}
                onClick={() => scrollByCard("left")}
              />
            </div>
          ) : null}

          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex min-w-0 flex-1 cursor-grab select-none snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [touch-action:pan-y] active:cursor-grabbing [scrollbar-width:none] max-[499px]:max-w-none min-[500px]:max-[639px]:max-w-[280px] lg:gap-16 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((award, index) => (
              <div
                key={awardKey(award, index)}
                className="min-w-0 flex-none basis-full snap-start sm:basis-[calc(50%-12px)] lg:basis-[calc(50%-32px)]"
              >
                <AwardCard
                  award={award}
                  titleHeight={titleHeight}
                  titleRef={(el) => {
                    titleRefs.current[index] = el;
                  }}
                />
              </div>
            ))}
          </div>

          {showArrows ? (
            <div
              className="flex flex-none items-center justify-center"
              style={arrowRailStyle}
            >
              <AwardScrollArrow
                direction="right"
                disabled={!canScrollRight}
                onClick={() => scrollByCard("right")}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}