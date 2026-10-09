"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";

// Paste your image links here later (one per tile).
const GALLERY_IMAGES: { src: string; alt: string }[] = [
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356245600-7oqve-rectangle-210-4-.webp", alt: "Art therapy session with a patient" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356345002-y58ti-rectangle-211-4-.webp", alt: "Patients and volunteers with art work" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356381758-vfduz-rectangle-212-4-.webp", alt: "Patient with caregiver smiling" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356414992-dec74-rectangle-213-3-.webp", alt: "Gallery visitors at an exhibition" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356459093-35t5o-rectangle-210-5-.webp", alt: "Guests at a Swasthi event" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356497605-7539h-rectangle-211-5-.webp", alt: "Family at the gallery" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356530502-ikhta-rectangle-212-5-.webp", alt: "Mother and child showing their artwork" },
  { src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791356569601-tvwf5-rectangle-213-4-.webp", alt: "Child painting with a therapist" },
];

// Same horizontal padding as the "Why patients join" section.
const SECTION_PADDING =
  "w-full overflow-x-hidden px-8 sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40";

const TILE =
  "block w-full h-auto rounded-[0.375rem] pointer-events-none select-none";

const ARROW =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFD43B] text-neutral-900 transition-colors hover:bg-[#f0c527] disabled:cursor-not-allowed disabled:bg-[#FFE9A0] md:h-8 md:w-8 [&>svg]:size-3 md:[&>svg]:size-4";

export default function SwasthiGallerySection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, startIndex: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const tileStep = (el: HTMLElement) => {
    const tile = el.querySelector<HTMLElement>("[data-tile]");
    const row = el.firstElementChild as HTMLElement | null;
    const gap = row ? parseFloat(getComputedStyle(row).columnGap) || 0 : 0;
    return (tile?.offsetWidth ?? 0) + gap;
  };

  const maxIndex = (el: HTMLElement, step: number) => {
    if (step <= 0) return 0;
    return Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / step));
  };

  const currentIndex = (el: HTMLElement) => {
    const step = tileStep(el);
    return step > 0 ? Math.round(el.scrollLeft / step) : 0;
  };

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  // Native smooth scroll to an exact tile.
  const scrollToIndex = (el: HTMLElement, index: number) => {
    const step = tileStep(el);
    const next = Math.min(maxIndex(el, step), Math.max(0, index));
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(maxScroll, next * step), behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const measure = () => {
      const row = el.firstElementChild as HTMLElement | null;
      if (row && window.innerWidth < 1024) {
        const cols = window.innerWidth >= 768 ? 3 : 2;
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        const tile = `${((el.clientWidth - gap * (cols - 1)) / cols).toFixed(2)}px`;
        if (el.style.getPropertyValue("--gallery-tile") !== tile) {
          el.style.setProperty("--gallery-tile", tile);
        }
      }
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scrollByTile = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el || window.innerWidth >= 1024) return;
    scrollToIndex(el, currentIndex(el) + direction);
  };

  // Mouse-only drag. Touch and pen use the browser's native horizontal scroll
  // (with scroll-snap), which is what makes swiping work on iPhone.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (window.innerWidth >= 1024) return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      startIndex: currentIndex(el),
    };
    setGrabbing(true);
    el.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!drag.current.active || !el) return;
    const step = tileStep(el);
    const next = drag.current.scrollLeft - (event.clientX - drag.current.startX);
    // Dragging can never travel more than one tile from where it started.
    const min = Math.max(0, drag.current.scrollLeft - step);
    const max = Math.min(el.scrollWidth - el.clientWidth, drag.current.scrollLeft + step);
    el.scrollLeft = Math.min(max, Math.max(min, next));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = scrollerRef.current;
    if (el && window.innerWidth < 1024) {
      const delta = event.clientX - drag.current.startX;
      const direction = delta <= -24 ? 1 : delta >= 24 ? -1 : 0;
      scrollToIndex(el, drag.current.startIndex + direction);
    }
    setGrabbing(false);
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className={`bg-[#FFF8E2] ${SECTION_PADDING}`}>
      <div className="flex w-full flex-col space-y-[1.5rem] py-2 sm:space-y-[2rem] sm:py-4 lg:py-6">
        <div>
          <Typography
            variant="heading-6"
            as="h2"
            data-detail-anim="slide"
            className="font-tiempos-headline font-normal text-left text-[#0D2838]"
          >
            Gallery
          </Typography>
        </div>

        <div className="flex items-center gap-2 lg:block">
          <button
            type="button"
            aria-label="Previous images"
            disabled={atStart}
            onClick={() => scrollByTile(-1)}
            className={`shrink-0 lg:hidden ${ARROW}`}
          >
            <ChevronLeft />
          </button>

          {/* Below lg: one row, leftover images scroll one at a time.
              Touch swipe is native (scroll-snap); mouse drag is custom.
              lg and up: fixed grid, 4 columns x 2 rows. */}
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={`min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible ${
              grabbing
                ? "cursor-grabbing snap-none"
                : "cursor-grab snap-x snap-mandatory lg:cursor-auto lg:snap-none"
            }`}
          >
            <div className="flex w-max gap-3 sm:gap-4 lg:grid lg:w-full lg:grid-cols-4 lg:gap-5">
              {GALLERY_IMAGES.map((img, index) => (
                <div
                  key={img.src}
                  data-tile
                  data-detail-anim="slide"
                  data-detail-anim-delay={(index % 5) * 80}
                  className="w-[var(--gallery-tile)] shrink-0 snap-start snap-always lg:w-auto"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" draggable={false} className={TILE} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next images"
            disabled={atEnd}
            onClick={() => scrollByTile(1)}
            className={`shrink-0 lg:hidden ${ARROW}`}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}