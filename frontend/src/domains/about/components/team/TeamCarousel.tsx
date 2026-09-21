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

/**
 * Desktop track carousel. `visibleCount` / `cardWidthPx` default to the
 * original lg/xl values (3 cards at CARD_W) so the same component can be
 * reused for the 2xl grid when there are more than 4 people.
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
  const step = cardWidthPx + CAROUSEL_GAP_PX;
  const maxIndex = Math.max(0, people.length - visibleCount);
  const [index, setIndex] = useState(0);
  const needsCarousel = people.length > visibleCount;
  const [dragging, setDragging] = useState(false);
  const [dragDeltaPx, setDragDeltaPx] = useState(0);
  const dragStartXRef = useRef(0);
  const trackViewportRef = useRef<HTMLDivElement>(null);
  const wheelLockedRef = useRef(false);
  const [stackHeight, setStackHeight] = useState<number | null>(null);
  const [stackOverhang, setStackOverhang] = useState(0);

  const clampIndex = useCallback(
    (i: number) => Math.min(maxIndex, Math.max(0, i)),
    [maxIndex],
  );

  useEffect(() => {
    setIndex((i) => clampIndex(i));
  }, [clampIndex]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!needsCarousel) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    setDragging(true);
    dragStartXRef.current = e.clientX;
    setDragDeltaPx(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragDeltaPx(e.clientX - dragStartXRef.current);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = step / 4;
    if (dragDeltaPx <= -threshold) {
      setIndex((i) => clampIndex(i + 1));
    } else if (dragDeltaPx >= threshold) {
      setIndex((i) => clampIndex(i - 1));
    }
    setDragDeltaPx(0);
  };

  useEffect(() => {
    const el = trackViewportRef.current;
    if (!el || !needsCarousel) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < WHEEL_DELTA_THRESHOLD) return;
      e.preventDefault();
      if (wheelLockedRef.current) return;
      wheelLockedRef.current = true;
      setIndex((i) => clampIndex(i + (e.deltaX > 0 ? 1 : -1)));
      window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, WHEEL_STEP_LOCK_MS);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [needsCarousel, clampIndex]);

  const { setRef: setLabelRef, height: labelHeight } =
    useSyncedLabelHeight(people.length);

  const measureStack = useCallback(() => {
    const image =
      trackViewportRef.current?.querySelector<HTMLElement>("[data-card-image]");
    const yellow =
      trackViewportRef.current?.querySelector<HTMLElement>("[data-yellow-bg]");
    if (!image || !yellow) return;
    const imageRect = image.getBoundingClientRect();
    const yellowRect = yellow.getBoundingClientRect();
    const top = Math.min(yellowRect.top, imageRect.top);
    const bottom = Math.max(yellowRect.bottom, imageRect.bottom);
    setStackHeight(bottom - top);
    setStackOverhang(Math.max(0, yellowRect.top - imageRect.top));
  }, []);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => measureStack());
    const onResize = () => measureStack();
    window.addEventListener("resize", onResize);
    const image =
      trackViewportRef.current?.querySelector<HTMLElement>("[data-card-image]");
    const yellow =
      trackViewportRef.current?.querySelector<HTMLElement>("[data-yellow-bg]");
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
  }, [measureStack, people.length, labelHeight, cardWidthPx, visibleCount]);

  const atStart = index === 0;
  const atEnd = index >= maxIndex;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  const minTranslateX = -(maxIndex * step);
  const maxTranslateX = 0;
  const baseTranslateX = -(index * step);
  const trackTranslateX = dragging
    ? Math.min(
        maxTranslateX,
        Math.max(minTranslateX, baseTranslateX + dragDeltaPx),
      )
    : baseTranslateX;

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
    <div className="mx-auto -mt-20 flex w-fit max-w-full items-start gap-2">
      {needsCarousel ? arrowRail("left") : null}

      <div
        ref={trackViewportRef}
        className={cx(
          "w-[var(--track-w)] max-w-full overflow-hidden pt-20",
          needsCarousel && "touch-pan-y select-none",
          dragging ? "cursor-grabbing" : needsCarousel && "cursor-grab",
        )}
        style={{ "--track-w": `${trackWidth}px` } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className={cx(
            "flex translate-x-[var(--track-x)] gap-6 ease-out",
            dragging ? "duration-0" : "transition-transform duration-500",
          )}
          style={{ "--track-x": `${trackTranslateX}px` } as CSSProperties}
        >
          {people.map((p, i) => (
            <PersonCard
              key={personKey(p, i)}
              {...p}
              widthClass={CAROUSEL_CARD_WIDTH_CLASS}
              style={{ "--card-w": `${cardWidthPx}px` } as CSSProperties}
              labelRef={setLabelRef(i)}
              labelHeight={labelHeight}
            />
          ))}
        </div>
      </div>

      {needsCarousel ? arrowRail("right") : null}
    </div>
  );
}
