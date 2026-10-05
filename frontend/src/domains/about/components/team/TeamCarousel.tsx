"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CARD_W, type Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { ArrowButton } from "./TeamIcons";
import {
  CAROUSEL_CARD_WIDTH_CLASS,
  CAROUSEL_GAP_PX,
  WHEEL_DELTA_THRESHOLD,
  WHEEL_STEP_LOCK_MS,
  cx,
  personKey,
} from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

/** Matches track `pt-20` so the arrow rail lines up with the portrait. */
const TRACK_TOP_PAD = "5rem";
/** Minimum horizontal drag (px) before a mouse/touch drag counts as a "next/prev" gesture. */
const SWIPE_THRESHOLD_PX = 30;
/** How long (ms) a clicked arrow's target index is trusted while the smooth scroll is still running. */
const PENDING_TARGET_MS = 650;

/**
 * Desktop track carousel. `visibleCount` / `cardWidthPx` default to the
 * original lg/xl values (3 cards at CARD_W) so the same component can be
 * reused for the 2xl grid when there are more than 4 people.
 *
 * Scrolling model: a real overflow-x-auto + snap-x track. Every gesture
 * (arrow, wheel, touch, mouse drag) moves to an exact card INDEX
 * (index * step), so the track always lands with whole cards aligned to
 * the left edge — never half cards — for any visibleCount (1, 2, 3, 4...).
 */
export function TeamCarousel({
  people,
  visibleCount = 3,
  cardWidthPx = CARD_W,
}: {
  people: Person[];
  visibleCount?: number;
  cardWidthPx?: number;
}) {
  const trackWidth =
    visibleCount * cardWidthPx + (visibleCount - 1) * CAROUSEL_GAP_PX;
  const needsCarousel = people.length > visibleCount;

  // Card width is derived purely in CSS (container query units): the smaller
  // of the design width or an equal share of the available track width, so
  // exactly `visibleCount` whole cards always fit.
  const totalGapsPx = (visibleCount - 1) * CAROUSEL_GAP_PX;
  const cardWidthExpr = `min(${cardWidthPx}px, calc((100cqw - ${totalGapsPx}px) / ${visibleCount}))`;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(!needsCarousel);
  const [dragging, setDragging] = useState(false);
  const [stackHeight, setStackHeight] = useState<number | null>(null);
  const [stackOverhang, setStackOverhang] = useState(0);

  const { setRef: setLabelRef, height: labelHeight } =
    useSyncedLabelHeight(people.length);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  /** Exact distance (px) between two neighbouring cards, measured from the DOM. */
  const getCardStep = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    if (cards.length >= 2) {
      return (
        cards[1].getBoundingClientRect().left -
        cards[0].getBoundingClientRect().left
      );
    }
    const card = cards[0];
    return card ? card.offsetWidth + CAROUSEL_GAP_PX : el.clientWidth;
  }, []);

  /** Highest valid card index to land on. */
  const getMaxIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const step = getCardStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / step));
  }, [getCardStep]);

  // Target index of an in-flight smooth scroll, so rapid arrow clicks keep
  // stepping from where the carousel is GOING, not from a mid-animation offset.
  const pendingIndexRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<number | null>(null);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const step = getCardStep();
      const maxIndex = getMaxIndex();
      const clamped = Math.min(maxIndex, Math.max(0, index));

      pendingIndexRef.current = clamped;
      if (pendingTimerRef.current != null)
        window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = window.setTimeout(() => {
        pendingIndexRef.current = null;
      }, PENDING_TARGET_MS);

      el.scrollTo({ left: clamped * step, behavior: "smooth" });
    },
    [getCardStep, getMaxIndex],
  );

  /** Advance/retreat by exactly one card, always landing on a card boundary. */
  const scrollByCard = useCallback(
    (dir: 1 | -1) => {
      const el = scrollRef.current;
      if (!el) return;
      const step = getCardStep();
      if (step <= 0) return;
      const base =
        pendingIndexRef.current ?? Math.round(el.scrollLeft / step);
      scrollToIndex(base + dir);
    },
    [getCardStep, scrollToIndex],
  );

  const goPrev = () => scrollByCard(-1);
  const goNext = () => scrollByCard(1);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current != null)
        window.clearTimeout(pendingTimerRef.current);
    };
  }, []);

  // ---- Gesture capture: wheel, touch — each always moves the carousel by
  // exactly one card, no matter how fast/far/long the gesture is.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !needsCarousel) return;

    // ---- Wheel / trackpad horizontal scroll ----
    let wheelLocked = false;
    let wheelResetTimer: number | null = null;

    const onWheel = (e: WheelEvent) => {
      const horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontalIntent) return; // let normal vertical page scroll pass through
      e.preventDefault();
      if (wheelLocked || Math.abs(e.deltaX) < WHEEL_DELTA_THRESHOLD) return;

      wheelLocked = true;
      scrollByCard(e.deltaX > 0 ? 1 : -1);

      if (wheelResetTimer != null) window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelLocked = false;
      }, WHEEL_STEP_LOCK_MS);
    };

    // ---- Touch drag ----
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    let axis: "x" | "y" | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
      axis = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x") {
        // Own the gesture so native scroll can't outrun the one-card rule;
        // vertical page scroll (axis "y") is left completely alone.
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive) return;
      touchActive = false;
      if (axis !== "x") return;

      const endX = e.changedTouches[0].clientX;
      const dx = endX - touchStartX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        scrollByCard(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      if (wheelResetTimer != null) window.clearTimeout(wheelResetTimer);
    };
  }, [needsCarousel, scrollByCard]);

  // ---- Mouse click-drag (desktop, non-touch pointers only) ----
  // Uses refs (not React state) for the live drag values so every
  // pointermove reads the current, non-stale drag status.
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!needsCarousel || e.pointerType !== "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    const el = scrollRef.current;
    if (!el) return;

    e.preventDefault(); // stop native image drag / text selection from hijacking the gesture
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    dragMovedRef.current = true;
    // Live-follow the cursor while dragging.
    el.scrollLeft =
      dragStartScrollLeftRef.current - (e.clientX - dragStartXRef.current);
  };

  const endPointerDrag = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDragging(false);
    const el = scrollRef.current;
    if (!el) return;

    if (!dragMovedRef.current) return; // plain click, not a drag — nothing to snap

    const step = getCardStep();
    if (step <= 0) return;

    const totalDelta = e.clientX - dragStartXRef.current;
    const threshold = step / 4;

    let dir: -1 | 0 | 1 = 0;
    if (totalDelta <= -threshold) dir = 1; // dragged left → next card
    else if (totalDelta >= threshold) dir = -1; // dragged right → previous card

    const startIndex = Math.round(dragStartScrollLeftRef.current / step);
    scrollToIndex(startIndex + dir);
  };

  const measureStack = useCallback(() => {
    const image =
      scrollRef.current?.querySelector<HTMLElement>("[data-card-image]");
    const yellow =
      scrollRef.current?.querySelector<HTMLElement>("[data-yellow-bg]");
    if (!image || !yellow) return;
    const imageRect = image.getBoundingClientRect();
    const yellowRect = yellow.getBoundingClientRect();
    const top = Math.min(yellowRect.top, imageRect.top);
    const bottom = Math.max(yellowRect.bottom, imageRect.bottom);
    setStackHeight(bottom - top);
    setStackOverhang(Math.max(0, yellowRect.top - imageRect.top));
  }, []);

  useEffect(() => {
    updateEdges();
    const raf = window.requestAnimationFrame(() => measureStack());
    const onResize = () => {
      updateEdges();
      measureStack();
      // Re-align to a whole card after the card width changes.
      const el = scrollRef.current;
      const step = getCardStep();
      if (el && step > 0) {
        el.scrollTo({
          left: Math.min(getMaxIndex(), Math.round(el.scrollLeft / step)) * step,
          behavior: "auto",
        });
      }
    };
    window.addEventListener("resize", onResize);

    const image =
      scrollRef.current?.querySelector<HTMLElement>("[data-card-image]");
    const yellow =
      scrollRef.current?.querySelector<HTMLElement>("[data-yellow-bg]");
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureStack())
        : null;
    if (ro && image) ro.observe(image);
    if (ro && yellow) ro.observe(yellow);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [
    measureStack,
    updateEdges,
    getCardStep,
    getMaxIndex,
    people.length,
    labelHeight,
    cardWidthPx,
    visibleCount,
  ]);

  const arrowRail = (side: "left" | "right") => (
    <div className="flex flex-none flex-col">
      <div
        aria-hidden
        style={{
          height: `max(0px, calc(${TRACK_TOP_PAD} - ${stackOverhang}px))`,
        }}
      />
      <div
        className="flex items-center justify-center"
        style={
          stackHeight != null ? { height: stackHeight } : { height: "16rem" }
        }
      >
        <ArrowButton
          direction={side}
          disabled={side === "left" ? atStart : atEnd}
          onClick={side === "left" ? goPrev : goNext}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto -mt-20 flex w-full max-w-full min-w-0 items-start justify-center gap-2">
      {needsCarousel ? arrowRail("left") : null}

      <div
        ref={scrollRef}
        onScroll={updateEdges}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onPointerLeave={endPointerDrag}
        style={{
          "--track-w": `${trackWidth}px`,
          width: `min(${trackWidth}px, 100%)`,
          touchAction: "pan-y",
          scrollSnapType: dragging ? "none" : undefined,
          containerType: "inline-size",
        } as CSSProperties}
        className={cx(
          "min-w-0 overflow-x-auto pt-20",
          "snap-x snap-mandatory scroll-smooth",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
          needsCarousel && "select-none",
          dragging && "select-none",
          dragging ? "cursor-grabbing" : needsCarousel && "cursor-grab",
        )}
      >
        {/* Gap is set from the same constant used in the card-width math so
            step size and card size can never drift apart. */}
        <div className="flex" style={{ gap: CAROUSEL_GAP_PX }}>
          {people.map((p, i) => (
            <div
              key={personKey(p, i)}
              data-card
              className="flex-none snap-start"
            >
              <PersonCard
                {...p}
                widthClass={CAROUSEL_CARD_WIDTH_CLASS}
                style={{ "--card-w": cardWidthExpr } as CSSProperties}
                labelRef={setLabelRef(i)}
                labelHeight={labelHeight}
              />
            </div>
          ))}
        </div>
      </div>

      {needsCarousel ? arrowRail("right") : null}
    </div>
  );
}