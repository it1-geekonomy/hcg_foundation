"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode | ((isFlipped: boolean) => React.ReactNode);
  className?: string;
  roundedClassName?: string;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  flipOnHover?: boolean;
  duration?: number;
}

export function FlipCard({
  front,
  back,
  className = "",
  roundedClassName = "rounded-[1.2643rem]",
  isFlipped: controlledFlipped,
  onFlipChange,
  onClick,
  flipOnHover = true,
  duration = 0.55,
}: FlipCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const isTouchRef = useRef(false);

  const setFlip = (flipped: boolean) => {
    if (controlledFlipped === undefined) setInternalFlipped(flipped);
    onFlipChange?.(flipped);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (!flipOnHover) return;
    if (e.pointerType === "touch") {
      isTouchRef.current = true;
      return;
    }
    isTouchRef.current = false;
    setFlip(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (!flipOnHover) return;
    if (e.pointerType === "touch") return;
    setFlip(false);
  };

  // On touch devices, tap outside flips the card back
  useEffect(() => {
    if (!isFlipped) return;
    const handleOutsideClick = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFlip(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isFlipped]);

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = isTouchRef.current || (e.nativeEvent as PointerEvent)?.pointerType === "touch";

    if (isTouch) {
      if (!isFlipped) {
        // First tap on touch screen: flip to reveal the back face
        e.preventDefault();
        e.stopPropagation();
        setFlip(true);
        return;
      }
      // If already flipped, tap navigates to details page
      onClick?.(e);
      return;
    }

    // On desktop mouse: always execute click action (e.g. navigation)
    onClick?.(e);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "group relative block w-full select-none cursor-pointer [perspective:1200px]",
        className
      )}
    >
      <div className="relative h-full w-full">
        {/* Front Face: Rotates from 0 to 180 */}
        <motion.div
          className={cn(
            "absolute inset-0 h-full w-full overflow-hidden",
            roundedClassName,
            isFlipped ? "pointer-events-none z-0" : "pointer-events-auto z-10"
          )}
          initial={false}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: duration,
            ease: [0.25, 1, 0.5, 1],
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {front}
        </motion.div>

        {/* Back Face: Rotates from -180 to 0 (lands at 0deg so zero subpixel blur or texture downscaling) */}
        <motion.div
          className={cn(
            "absolute inset-0 h-full w-full overflow-hidden",
            roundedClassName,
            isFlipped ? "pointer-events-auto z-10" : "pointer-events-none z-0"
          )}
          initial={false}
          animate={{
            rotateY: isFlipped ? 0 : -180,
          }}
          transition={{
            duration: duration,
            ease: [0.25, 1, 0.5, 1],
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {typeof back === "function" ? back(isFlipped) : back}
        </motion.div>
      </div>
    </div>
  );
}

export default FlipCard;
