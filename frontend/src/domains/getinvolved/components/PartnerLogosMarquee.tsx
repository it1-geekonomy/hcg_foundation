"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  // Position & momentum state (runs on GPU transform: translate3d)
  const offsetRef = useRef(0);
  const isInteractingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const momentumVelocityRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Touch tracking refs
  const lastTouchXRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const gestureDirectionRef = useRef<"horizontal" | "vertical" | null>(null);

  // Mouse drag tracking refs
  const isMouseDownRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const lastMouseTimeRef = useRef(0);

  // Continuous auto-move + momentum animation loop on GPU translate3d
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const step = (currentTime: number) => {
      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const oneSetWidth = firstSetRef.current?.offsetWidth || 0;

      // When user is not actively dragging:
      if (!isInteractingRef.current && !isHoveredRef.current) {
        // If user flicked with finger/mouse, apply smooth momentum glide
        if (Math.abs(momentumVelocityRef.current) > 0.4) {
          offsetRef.current += momentumVelocityRef.current;
          momentumVelocityRef.current *= 0.93; // Smooth inertial deceleration
        } else {
          momentumVelocityRef.current = 0;
          offsetRef.current += speedPixelsPerSecond * deltaSeconds;
        }
      }

      // Seamless infinite wrapping: when offset reaches the width of one set, loop back
      if (oneSetWidth > 0) {
        if (offsetRef.current >= oneSetWidth) {
          offsetRef.current = offsetRef.current % oneSetWidth;
        } else if (offsetRef.current < 0) {
          offsetRef.current = oneSetWidth + (offsetRef.current % oneSetWidth);
        }
      }

      // Apply hardware-accelerated transform directly
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [speedPixelsPerSecond]);

  // Touch handlers for mobile (iPhone & Android)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isInteractingRef.current = true;
    momentumVelocityRef.current = 0;
    lastTouchXRef.current = e.touches[0].clientX;
    lastTouchYRef.current = e.touches[0].clientY;
    lastTouchTimeRef.current = performance.now();
    gestureDirectionRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const currentTime = performance.now();

    const dx = currentX - lastTouchXRef.current;
    const dy = currentY - lastTouchYRef.current;

    // Detect gesture direction on initial movement
    if (gestureDirectionRef.current === null) {
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        gestureDirectionRef.current = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
      }
    }

    // If user is swiping horizontally, move logos smoothly with their finger
    if (gestureDirectionRef.current === "horizontal") {
      offsetRef.current -= dx;
      const dt = Math.max((currentTime - lastTouchTimeRef.current) / 1000, 0.001);
      // Track finger velocity for fast momentum glide on flick
      const velocity = (-dx / dt) * 0.016;
      momentumVelocityRef.current = Math.max(Math.min(velocity, 35), -35);
    }

    lastTouchXRef.current = currentX;
    lastTouchYRef.current = currentY;
    lastTouchTimeRef.current = currentTime;
  };

  const handleTouchEnd = () => {
    isInteractingRef.current = false;
    gestureDirectionRef.current = null;
  };

  // Desktop mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    isInteractingRef.current = true;
    setIsDragging(true);
    momentumVelocityRef.current = 0;
    lastMouseXRef.current = e.clientX;
    lastMouseTimeRef.current = performance.now();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const currentX = e.clientX;
      const currentTime = performance.now();
      const dx = currentX - lastMouseXRef.current;

      offsetRef.current -= dx;
      const dt = Math.max((currentTime - lastMouseTimeRef.current) / 1000, 0.001);
      const velocity = (-dx / dt) * 0.016;
      momentumVelocityRef.current = Math.max(Math.min(velocity, 35), -35);

      lastMouseXRef.current = currentX;
      lastMouseTimeRef.current = currentTime;
    };

    const handleMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        isInteractingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 4 identical sets to seamlessly cover all screens up to 4K displays
  const sets = [0, 1, 2, 3];

  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden py-2 select-none">
        {/* Edge fade gradients for smooth entrance/exit */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#FFF8E2] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#FFF8E2] to-transparent z-10" />

        {/* Viewport container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") {
              isHoveredRef.current = true;
            }
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") {
              isHoveredRef.current = false;
            }
          }}
          className={`w-full overflow-hidden touch-pan-y ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* GPU Hardware-Accelerated Sliding Track */}
          <div
            ref={trackRef}
            className="flex w-max items-center py-1 will-change-transform"
          >
            {sets.map((setIdx) => (
              <div
                key={`set-${setIdx}`}
                ref={setIdx === 0 ? firstSetRef : undefined}
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
