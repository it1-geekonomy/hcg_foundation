"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GALLERY_IMAGES } from "@/domains/ourprograms/Swasthigallery/constants/gallerysection";

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Scroll gallery left" : "Scroll gallery right"}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

// Minimum pixel movement before a drag counts as an intentional swipe.
const DRAG_THRESHOLD = 40;
// Minimum wheel deltaX before a trackpad/wheel gesture counts as a swipe.
const WHEEL_THRESHOLD = 10;
// Time to ignore further wheel events after triggering one card move,
// so a single trackpad swipe (which fires many wheel events) only moves once.
const WHEEL_LOCK_MS = 450;

export default function GallerySection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    horizontal: false,
  });
  const wheelLockRef = useRef(false);
  const wheelUnlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateArrowState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 1px tolerance guards against sub-pixel rounding at the extremes.
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setHasOverflow(scrollWidth > clientWidth + 1);
  };

  useEffect(() => {
    updateArrowState();

    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);
    // Images may load after mount and change scrollWidth — recheck once they do.
    const imgs = el.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", updateArrowState));

    return () => {
      el.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
      imgs.forEach((img) => img.removeEventListener("load", updateArrowState));
      if (wheelUnlockTimeoutRef.current) clearTimeout(wheelUnlockTimeoutRef.current);
    };
  }, []);

  const getStep = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>("[data-gallery-card]");
    const gap = 16; // matches gap-4
    return card ? card.offsetWidth + gap : el.clientWidth;
  };

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  // --- Pointer drag: one drag gesture moves exactly one card, regardless
  // of how far or how fast the user drags. Works for touch and mouse.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      horizontal: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.dragging) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (!state.horizontal) {
      // Only "claim" the gesture as horizontal once it's clearly more
      // horizontal than vertical, so vertical page scrolling still works.
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      state.horizontal = true;
    }

    // Prevent the browser's own free-scroll/pan from moving the track;
    // we decide the final position ourselves on release.
    e.preventDefault();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.dragging) return;

    const dx = e.clientX - state.startX;
    if (state.horizontal && Math.abs(dx) >= DRAG_THRESHOLD) {
      scrollByCard(dx < 0 ? "right" : "left");
    }

    dragStateRef.current = { dragging: false, startX: 0, startY: 0, horizontal: false };
  };

  // --- Wheel / trackpad: one swipe gesture moves exactly one card.
  // Vertical-dominant wheel events are left alone so page scroll still works.
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const { deltaX, deltaY } = e;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    e.preventDefault();

    if (wheelLockRef.current || Math.abs(deltaX) < WHEEL_THRESHOLD) return;

    wheelLockRef.current = true;
    scrollByCard(deltaX > 0 ? "right" : "left");

    if (wheelUnlockTimeoutRef.current) clearTimeout(wheelUnlockTimeoutRef.current);
    wheelUnlockTimeoutRef.current = setTimeout(() => {
      wheelLockRef.current = false;
    }, WHEEL_LOCK_MS);
  };

  return (
    <div className="mt-8 w-full lg:mt-14 xl:mt-24 pb-8">
      <div className="flex w-full max-w-xs mx-auto items-center gap-1 sm:max-w-none sm:mx-0">
        {hasOverflow && (
          <ArrowButton direction="left" onClick={() => scrollByCard("left")} disabled={!canScrollLeft} />
        )}

        <div
          ref={scrollerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={handleWheel}
          style={{ touchAction: "pan-y" }}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {GALLERY_IMAGES.map((image) => (
            <div
              key={image.src}
              data-gallery-card
              className="relative h-72 w-full shrink-0 snap-start overflow-hidden rounded-sm sm:h-64 sm:w-[calc((100%-1rem)/2)] md:h-72 md:w-[calc((100%-1rem)/2)] lg:h-80 lg:w-[calc((100%-2rem)/3)] xl:h-96 xl:w-[calc((100%-3rem)/4)]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {hasOverflow && (
          <ArrowButton direction="right" onClick={() => scrollByCard("right")} disabled={!canScrollRight} />
        )}
      </div>
    </div>
  );
}