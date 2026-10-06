"use client";

import React, { useRef, useEffect, useState } from "react";
import { PARTNER_LOGOS } from "../constants/csr-partner";

interface PartnerLogosMarqueeProps {
  className?: string;
  speedPixelsPerSecond?: number;
  logoHeight?: string;
}

export default function PartnerLogosMarquee({
  className = "mb-8 sm:mb-12 w-full",
  speedPixelsPerSecond = 42,
  logoHeight = "h-12 sm:h-14 md:h-16",
}: PartnerLogosMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isWheelActiveRef = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Normalize scroll position for seamless infinite looping in either direction
  const normalizeScroll = () => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // 4 identical sets rendered; one set width is total scrollWidth / 4
    const oneSetWidth = track.scrollWidth / 4;
    if (oneSetWidth <= 0) return;

    if (container.scrollLeft >= oneSetWidth * 2) {
      container.scrollLeft -= oneSetWidth;
    } else if (container.scrollLeft < oneSetWidth) {
      container.scrollLeft += oneSetWidth;
    }
  };

  // Center initial scroll position so user can scroll both left and right immediately
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const initPos = () => {
      const oneSetWidth = track.scrollWidth / 4;
      if (oneSetWidth > 0) {
        container.scrollLeft = oneSetWidth;
      }
    };

    // Run after layout render
    const raf = requestAnimationFrame(initPos);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Continuous smooth auto-marquee loop via requestAnimationFrame
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (currentTime: number) => {
      const deltaSeconds = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Auto-move when not dragging, not hovered, and not active wheel scrolling
      if (
        !isDraggingRef.current &&
        !isHoveredRef.current &&
        !isWheelActiveRef.current
      ) {
        container.scrollLeft += speedPixelsPerSecond * deltaSeconds;
        normalizeScroll();
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [speedPixelsPerSecond]);

  // Pointer drag events for smooth mouse swipe & drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;

    try {
      container.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 3) {
      hasMovedRef.current = true;
    }
    containerRef.current.scrollLeft = startScrollLeftRef.current - dx;
    normalizeScroll();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    const container = containerRef.current;
    if (container) {
      try {
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
  };

  // Mouse wheel scroll support (horizontal or vertical mouse wheel)
  const handleWheel = (e: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 0) {
      container.scrollLeft += delta;
      normalizeScroll();

      isWheelActiveRef.current = true;
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelActiveRef.current = false;
      }, 900);
    }
  };

  // 4 identical sets to allow infinite forward & backward scroll without ever showing blank edge
  const sets = [0, 1, 2, 3];

  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden py-2">
        {/* Edge fade gradients for smooth entrance/exit */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#FFF8E2] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#FFF8E2] to-transparent z-10" />

        {/* Scroll container with mouse drag, wheel scroll, and auto-movement */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
          className={`relative w-full overflow-x-auto select-none touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div
            ref={trackRef}
            className="flex w-max items-center py-1"
          >
            {sets.map((setIdx) => (
              <div
                key={`set-${setIdx}`}
                aria-hidden={setIdx > 0}
                className="flex shrink-0 items-center gap-10 sm:gap-14 pr-10 sm:pr-14"
              >
                {PARTNER_LOGOS.map((logo, idx) => (
                  <img
                    key={`${logo.id}-${setIdx}-${idx}`}
                    src={logo.src}
                    alt={logo.alt}
                    draggable={false}
                    className={`${logoHeight} w-auto object-contain shrink-0 transition-transform duration-300 hover:scale-105 pointer-events-none select-none`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
