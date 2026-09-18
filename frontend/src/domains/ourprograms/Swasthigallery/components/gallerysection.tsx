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

export default function GallerySection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

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
    };
  }, []);

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-gallery-card]");
    const gap = 16; // matches gap-4
    const step = card ? card.offsetWidth + gap : el.clientWidth;
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };
  return (
    <div className="mt-8 w-full lg:mt-14 xl:mt-24 pb-8">
      <div className="flex w-full max-w-xs mx-auto items-center gap-1 sm:max-w-none sm:mx-0">
        {hasOverflow && (
          <ArrowButton direction="left" onClick={() => scrollByCard("left")} disabled={!canScrollLeft} />
        )}

        <div
          ref={scrollerRef}
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