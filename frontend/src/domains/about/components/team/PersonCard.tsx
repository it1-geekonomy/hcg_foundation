"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Typography from "@/lib/Typography";
import {
  BACK_PANEL_BG,
  CARD_GRADIENT_BG,
  CARD_W,
  CARD_W_2XL,
  type Person,
} from "@/domains/about/constants/teams";

import {
  CARD_IMAGE_BOTTOM_INSET_CLASS,
  DEFAULT_CARD_TOP_OFFSET_CLASS,
  DEFAULT_CARD_WIDTH_CLASS,
  cx,
} from "./team-utils";

export type PersonCardProps = Person & {
  widthClass?: string;
  fadeBottom?: boolean;
  wrapLabel?: boolean;
  dropShadow?: boolean;
  topOffsetClass?: string;
  labelRef?: (el: HTMLDivElement | null) => void;
  labelHeight?: number | null;
  style?: CSSProperties;
  /** When false the card ignores hover/tap and stays on its front face. */
  flipEnabled?: boolean;
};

export function PersonCard({
  name,
  role,
  img,
  widthClass,
  topOffsetClass,
  description = [],
  labelRef,
  labelHeight,
  style,
  flipEnabled = true,
}: PersonCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);
  const showImage = Boolean(img?.trim()) && img !== "null" && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [img]);

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!flipEnabled) setFlipped(false);
  }, [flipEnabled]);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (!flipEnabled) return;
    if (e.pointerType === "touch") {
      isTouchRef.current = true;
      return;
    }
    isTouchRef.current = false;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setFlipped(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setFlipped(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!flipEnabled) return;
    const isTouch =
      isTouchRef.current ||
      (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) ||
      (e.nativeEvent as PointerEvent)?.pointerType === "touch";

    if (isTouch) {
      setFlipped((prev) => !prev);
    }
  };

  // On touch devices, tap outside flips the card back
  useEffect(() => {
    if (!flipped) return;

    const handleOutsideClick = (e: Event) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setFlipped(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [flipped]);

  // Smooth scroll accumulator and animation frame for seamless page scrolling
  const scrollAccumulatorRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const startSmoothPageScroll = (delta: number) => {
    // If direction reversed, reset accumulator to avoid fighting inertia
    if (
      (delta > 0 && scrollAccumulatorRef.current < 0) ||
      (delta < 0 && scrollAccumulatorRef.current > 0)
    ) {
      scrollAccumulatorRef.current = 0;
    }

    scrollAccumulatorRef.current += delta;

    if (rafIdRef.current === null) {
      const step = () => {
        if (Math.abs(scrollAccumulatorRef.current) < 1) {
          if (scrollAccumulatorRef.current !== 0) {
            window.scrollBy({ top: scrollAccumulatorRef.current, behavior: "auto" });
          }
          scrollAccumulatorRef.current = 0;
          rafIdRef.current = null;
          return;
        }

        // 0.25 ease-out lerp gives an organic, gliding feel that matches native smooth scrolling
        const move = scrollAccumulatorRef.current * 0.25;
        window.scrollBy({ top: move, behavior: "auto" });
        scrollAccumulatorRef.current -= move;

        rafIdRef.current = requestAnimationFrame(step);
      };
      rafIdRef.current = requestAnimationFrame(step);
    }
  };

  // Clean up animation on unmount or when card un-flips
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        scrollAccumulatorRef.current = 0;
      }
    };
  }, [flipped]);

  // When bio reaches the top/bottom boundary, seamlessly carry over leftover delta and momentum to page scroll
  const handleBioWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el) return;

    const maxScroll = el.scrollHeight - el.clientHeight;

    // If text does not overflow at all
    if (maxScroll <= 1) {
      startSmoothPageScroll(e.deltaY);
      return;
    }

    const isAtBottom = el.scrollTop >= maxScroll - 1.5;
    const isAtTop = el.scrollTop <= 0.5;

    if (e.deltaY > 0) {
      if (isAtBottom) {
        startSmoothPageScroll(e.deltaY);
      } else {
        const remaining = maxScroll - el.scrollTop;
        if (e.deltaY > remaining) {
          // Carry over leftover delta immediately to the page so it doesn't freeze at the bottom wall
          startSmoothPageScroll(e.deltaY - remaining);
        }
      }
    } else if (e.deltaY < 0) {
      if (isAtTop) {
        startSmoothPageScroll(e.deltaY);
      } else {
        const remaining = el.scrollTop;
        if (Math.abs(e.deltaY) > remaining) {
          // Carry over leftover delta upward immediately to the page
          startSmoothPageScroll(e.deltaY + remaining);
        }
      }
    }
  };

  const resolvedTopOffsetClass = topOffsetClass ?? DEFAULT_CARD_TOP_OFFSET_CLASS;

  // A card that just left the centre un-flips instantly; a 1s 3D rotation while it slides away wobbles on iOS.
  const currentDuration = !flipEnabled ? 0 : flipped ? 0.42 : 1.0;
  const currentEase: [number, number, number, number] = flipped
    ? [0.25, 1, 0.5, 1]
    : [0.4, 0.0, 0.2, 1];

  return (
    <div
      ref={cardRef}
      style={style}
      data-flipped={flipped ? "true" : undefined}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      // touch-pan-y: only vertical panning is native, so horizontal swipes reach the carousel.
      className={cx(
        "group relative aspect-[320/380] flex-none cursor-pointer touch-pan-y [perspective:1200px] select-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      <div className="relative h-full w-full">
        {/* Static non-rotating hit zone covering entire card area and top photo cutout */}
        <div
          aria-hidden="true"
          className={cx(
            "absolute inset-x-0 bottom-0 z-0 pointer-events-auto",
            resolvedTopOffsetClass,
          )}
        />

        {/* FRONT FACE (rotates 0 -> 180) */}
        <motion.div
          className={cx(
            "absolute inset-0 h-full w-full",
            flipped ? "pointer-events-none" : "pointer-events-auto",
          )}
          initial={false}
          animate={{
            rotateY: flipped ? 180 : 0,
            opacity: flipped ? 0 : 1,
          }}
          transition={{
            rotateY: { duration: currentDuration, ease: currentEase },
            opacity: {
              duration: 0.01,
              delay: flipped ? currentDuration * 0.45 : currentDuration * 0.5,
            },
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            WebkitFontSmoothing: "antialiased",
            transform: "translateZ(0)",
          }}
        >
          {/* Yellow Card Background */}
          <div
            data-yellow-bg
            className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]"
          />

          {/* Photo cutout extending out at top */}
          <div
            data-card-image
            className={cx(
              "absolute inset-x-0 overflow-hidden rounded-md",
              CARD_IMAGE_BOTTOM_INSET_CLASS,
              resolvedTopOffsetClass,
            )}
          >
            {showImage ? (
              <Image
                src={img}
                alt={name}
                fill
                sizes={`(min-width: 1536px) ${CARD_W_2XL}px, ${CARD_W}px`}
                className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                unoptimized={/^https?:\/\//i.test(img)}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onError={() => setImageFailed(true)}
              />
            ) : null}
          </div>

          {/* Glassmorphic Front Label (Without arrow button) */}
          <div
            ref={labelRef}
            style={{
              ...(labelHeight ? { minHeight: `${labelHeight}px` } : undefined),
            }}
            className={cx(
              "absolute inset-x-[0.875rem] bottom-[2.75rem] z-10 flex min-h-[5.25rem] items-center justify-between gap-3 rounded-xl px-4 py-2 lg:py-3 shadow-sm",
              CARD_GRADIENT_BG,
            )}
          >
            <div className="min-w-0 flex-1">
              <Typography
                variant="body-9"
                as="p"
                className="font-manrope font-semibold text-white"
                dangerouslySetInnerHTML={{ __html: name }}
              />
              {role ? (
                <Typography
                  variant="body-7"
                  as="p"
                  className="font-manrope font-normal text-white/85 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: role }}
                />
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* BACK FACE (rotates -180 -> 0) */}
        <motion.div
          className={cx(
            "absolute inset-0 h-full w-full",
            flipped ? "pointer-events-auto" : "pointer-events-none",
          )}
          initial={false}
          animate={{
            rotateY: flipped ? 0 : -180,
            opacity: flipped ? 1 : 0,
          }}
          // iOS Safari ignores backface-visibility under a filtered ancestor (the mobile coverflow),
          // so the back face also swaps opacity at the half-turn, mirroring the front face.
          transition={{
            rotateY: { duration: currentDuration, ease: currentEase },
            opacity: {
              duration: 0.01,
              delay: flipped ? currentDuration * 0.45 : currentDuration * 0.5,
            },
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            WebkitFontSmoothing: "antialiased",
            transform: "translateZ(0)",
          }}
        >
          {/* Yellow Card Background matching front */}
          <div
            className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]"
          />

          {/* Back panel covering exact same bounds as data-card-image */}
          <div
            className={cx(
              "absolute inset-x-0 overflow-hidden rounded-md border border-[#E0D4AE]/50 shadow-sm touch-pan-y",
              CARD_IMAGE_BOTTOM_INSET_CLASS,
              resolvedTopOffsetClass,
            )}
          >
            {/* Bio Content */}
            <div
              className={cx(
                "relative flex h-full w-full flex-col p-5 sm:p-6 overflow-hidden touch-pan-y",
                BACK_PANEL_BG,
              )}
            >
              {/* Header: Name and Role */}
              <div className="flex-none pb-2.5 border-b border-white/15">
                <Typography
                  variant="body-2"
                  as="p"
                  className="font-manrope font-semibold text-white tracking-tight"
                  dangerouslySetInnerHTML={{ __html: name }}
                />
                {role ? (
                  <Typography
                    variant="body-7"
                    as="p"
                    className="font-manrope font-normal text-white/80 mt-0.5 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: role }}
                  />
                ) : null}
              </div>

              {/* Bio / Description Paragraphs.
                  This is a scroll container, so it needs its own touch-pan-y: the browser stops
                  resolving touch-action at the nearest scroller and never reaches the carousel's. */}
              <div
                onWheel={handleBioWheel}
                className={cx(
                  "mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1.5 touch-pan-y",
                  "[scrollbar-width:none]",
                  "[-ms-overflow-style:none]",
                  "[&::-webkit-scrollbar]:hidden",
                )}
              >
                {description && description.length > 0
                  ? description.map((paragraph, i) => (
                      <Typography
                        key={i}
                        variant="body-7"
                        as="p"
                        className="font-manrope leading-relaxed font-normal text-white/90"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    ))
                  : null}
              </div>
            </div>

            {/* Left Sliding Door: Original Solid #FFF3CD */}
            <motion.div
              aria-hidden="true"
              initial={{ x: "0%" }}
              animate={{ x: flipped ? "-102%" : "0%" }}
              transition={{
                duration: flipped ? 0.82 : 0.01,
                delay: flipped ? 0 : 0.52,
                ease: flipped ? [0.65, 0, 0.25, 1] : "linear",
              }}
              className="absolute top-0 bottom-0 left-0 w-1/2 z-30 pointer-events-none overflow-hidden border-r border-[#E0D4AE] shadow-md bg-[#FFF3CD]"
            />

            {/* Right Sliding Door: Original Solid #FFF3CD */}
            <motion.div
              aria-hidden="true"
              initial={{ x: "0%" }}
              animate={{ x: flipped ? "102%" : "0%" }}
              transition={{
                duration: flipped ? 0.82 : 0.01,
                delay: flipped ? 0 : 0.52,
                ease: flipped ? [0.65, 0, 0.25, 1] : "linear",
              }}
              className="absolute top-0 bottom-0 right-0 w-1/2 z-30 pointer-events-none overflow-hidden border-l border-[#E0D4AE] shadow-md bg-[#FFF3CD]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}