"use client";

import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { CARD_W, type Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { ArrowButton } from "./TeamIcons";
import { CAROUSEL_GAP_PX, cx, personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

const FIXED_CARD_WIDTH_CLASS = `w-[${CARD_W}px]`;

/** Desktop track carousel (3 visible cards) — used between lg and 2xl. */
export function TeamCarousel({ people }: { people: Person[] }) {
  const visibleCount = 3;
  const trackWidth = visibleCount * CARD_W + (visibleCount - 1) * CAROUSEL_GAP_PX;
  const step = CARD_W + CAROUSEL_GAP_PX;
  const maxIndex = Math.max(0, people.length - visibleCount);
  const [index, setIndex] = useState(0);
  const needsCarousel = people.length > visibleCount;
  const [dragging, setDragging] = useState(false);
  const [dragDeltaPx, setDragDeltaPx] = useState(0);
  const dragStartXRef = useRef(0);

  const clampIndex = (i: number) => Math.min(maxIndex, Math.max(0, i));

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!needsCarousel) return;
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
    if (dragDeltaPx <= -threshold) setIndex((i) => clampIndex(i + 1));
    else if (dragDeltaPx >= threshold) setIndex((i) => clampIndex(i - 1));
    setDragDeltaPx(0);
  };

  const { setRef: setLabelRef, height: labelHeight } =
    useSyncedLabelHeight(people.length);

  return (
    <div className="mx-auto flex w-fit max-w-full items-center gap-2">
      {needsCarousel ? (
        <ArrowButton
          direction="left"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />
      ) : null}

      <div
        className={cx(
          "-mt-20 w-[var(--track-w)] max-w-full overflow-hidden pt-20",
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
          style={
            {
              "--track-x": `${-(index * step) + dragDeltaPx}px`,
            } as CSSProperties
          }
        >
          {people.map((p, i) => (
            <PersonCard
              key={personKey(p, i)}
              {...p}
              widthClass={FIXED_CARD_WIDTH_CLASS}
              labelRef={setLabelRef(i)}
              labelHeight={labelHeight}
            />
          ))}
        </div>
      </div>

      {needsCarousel ? (
        <ArrowButton
          direction="right"
          disabled={index >= maxIndex}
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        />
      ) : null}
    </div>
  );
}
