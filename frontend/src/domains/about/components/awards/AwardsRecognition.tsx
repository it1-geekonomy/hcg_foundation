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

/** Distance between two consecutive slides (slide width + gap). */
function getStep(track: HTMLElement): number {
  const first = track.children[0] as HTMLElement | undefined;
  const second = track.children[1] as HTMLElement | undefined;
  if (first && second) return second.offsetLeft - first.offsetLeft;
  if (first) {
    const gap = parseFloat(window.getComputedStyle(track).columnGap || "24") || 24;
    return first.offsetWidth + gap;
  }
  return track.clientWidth;
}

/**
 * Shared About Us awards section — used on the public site and in CMS preview.
 * Arrows are real flex siblings of the track (not absolutely positioned over
 * it), so they can never overlay the images; a 2px gap sits between them.
 * Below 640px the track's width is capped to match the visible card so the
 * arrows land right next to the image instead of at the far edges.
 *
 * Scrolling is fully controlled in JS (the track is overflow-x: hidden, so
 * the browser never flings it by itself). Every input — arrows, touch swipe,
 * mouse drag, horizontal wheel / trackpad — moves AT MOST ONE slide per
 * gesture, with a smooth settle animation:
 *  - Touch / mouse / pen: the track follows the pointer live, then settles on
 *    the next / previous slide (never further than one from where it began).
 *  - Wheel / trackpad: one slide per gesture; momentum events are ignored.
 *  - Vertical page scrolling is untouched (touch-action: pan-y).
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
  const dragStartScrollRef = useRef(0);
  const draggedDistanceRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const velocityRef = useRef(0); // px per ms, + = finger moving right

  // Where a programmatic smooth scroll is heading (so rapid clicks chain correctly).
  const targetLeftRef = useRef<number | null>(null);
  const targetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const clearTarget = useCallback(() => {
    targetLeftRef.current = null;
    if (targetTimerRef.current) {
      clearTimeout(targetTimerRef.current);
      targetTimerRef.current = null;
    }
  }, []);

  /** Smooth-scroll the track to an exact position. */
  const animateTo = useCallback(
    (left: number) => {
      const el = trackRef.current;
      if (!el) return;
      clearTarget();
      if (Math.abs(el.scrollLeft - left) < 1) return;

      targetLeftRef.current = left;
      // Forget the target once the animation is surely over.
      targetTimerRef.current = setTimeout(clearTarget, 900);
      el.scrollTo({ left, behavior: "smooth" });
    },
    [clearTarget],
  );

  useEffect(() => {
    titleRefs.current = titleRefs.current.slice(0, items.length);
    updateScrollState();
    updateTitleHeight();
    updateImageHeight();

    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      updateScrollState();
      const target = targetLeftRef.current;
      if (target !== null && Math.abs(el.scrollLeft - target) < 2) clearTarget();
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      updateScrollState();
      updateTitleHeight();
      updateImageHeight();
    };
    window.addEventListener("resize", onResize);

    // Layout can change without a window resize (arrows appearing, images loading).
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      clearTarget();
    };
  }, [items, updateScrollState, updateTitleHeight, updateImageHeight, clearTarget]);

  /** Move exactly one slide left / right from the current (or pending) position. */
  const scrollByCard = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const step = getStep(el);
    if (!step || step <= 0) return;

    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const pos = targetLeftRef.current ?? el.scrollLeft;

    const index =
      direction === "right"
        ? Math.floor(pos / step + 0.02) + 1
        : Math.ceil(pos / step - 0.02) - 1;

    animateTo(Math.min(Math.max(index * step, 0), maxLeft));
  };

  /* ---------- Wheel / trackpad: exactly one slide per gesture ---------- */
  const scrollByCardRef = useRef(scrollByCard);
  scrollByCardRef.current = scrollByCard;
  const wheelLockedRef = useRef(false);
  const wheelUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only take over clearly horizontal gestures; vertical scroll stays native.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();

      // Trackpad inertia keeps firing events: stay locked until they stop.
      if (wheelUnlockTimerRef.current) clearTimeout(wheelUnlockTimerRef.current);
      wheelUnlockTimerRef.current = setTimeout(() => {
        wheelLockedRef.current = false;
      }, 160);

      if (wheelLockedRef.current) return;
      wheelLockedRef.current = true;
      scrollByCardRef.current(e.deltaX > 0 ? "right" : "left");
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelUnlockTimerRef.current) clearTimeout(wheelUnlockTimerRef.current);
    };
  }, [items]);

  /* ---------- Swipe / drag (touch, mouse, pen) ---------- */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;

    clearTarget(); // interrupt any running animation
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = el.scrollLeft;
    draggedDistanceRef.current = 0;
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;

    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = trackRef.current;
    if (!el) return;

    const dx = e.clientX - dragStartXRef.current;
    draggedDistanceRef.current = dx;
    el.scrollLeft = dragStartScrollRef.current - dx; // follow the finger / cursor

    const now = performance.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt > 0) velocityRef.current = (e.clientX - lastMoveXRef.current) / dt;
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const el = trackRef.current;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture may already be released; safe to ignore
    }
    if (!el) return;

    const dx = draggedDistanceRef.current;
    draggedDistanceRef.current = 0;
    const step = getStep(el);
    if (!step) return;

    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const startIndex = Math.round(dragStartScrollRef.current / step);

    // Nearest slide, but never more than ONE slide away from where we started.
    let index = Math.round(el.scrollLeft / step);
    index = Math.min(Math.max(index, startIndex - 1), startIndex + 1);

    // A deliberate swipe (distance or speed) always advances one slide.
    const fast = Math.abs(velocityRef.current) > 0.4 && Math.abs(dx) > 12;
    const far = Math.abs(dx) >= 40;
    if (far || fast) {
      const forward = dx < 0; // dragging left reveals the next slide
      if (forward && index <= startIndex) index = startIndex + 1;
      else if (!forward && index >= startIndex) index = startIndex - 1;
    }

    animateTo(Math.min(Math.max(index * step, 0), maxLeft));
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

          {/* overflow-x-hidden: no native fling. touch-action pan-y: vertical page scroll still works. */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex min-w-0 flex-1 cursor-grab select-none gap-6 overflow-x-hidden [touch-action:pan-y] active:cursor-grabbing max-[499px]:max-w-none min-[500px]:max-[639px]:max-w-[280px] lg:gap-16"
          >
            {items.map((award, index) => (
              <div
                key={awardKey(award, index)}
                className="min-w-0 flex-none basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(50%-32px)]"
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