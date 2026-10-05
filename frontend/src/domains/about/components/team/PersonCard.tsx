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
import { ImageUnavailableNotice } from "../shared/ImageUnavailableNotice";
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
}: PersonCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);
  const showImage = Boolean(img?.trim()) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [img]);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      isTouchRef.current = true;
      return;
    }
    isTouchRef.current = false;
    setFlipped(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    setFlipped(false);
  };

  const handleClick = (e: React.MouseEvent) => {
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

  const resolvedTopOffsetClass = topOffsetClass ?? DEFAULT_CARD_TOP_OFFSET_CLASS;

  return (
    <div
      ref={cardRef}
      style={style}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cx(
        "group relative aspect-[320/380] flex-none cursor-pointer [perspective:1200px] select-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      <div className="relative h-full w-full">
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
            rotateY: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.01, delay: flipped ? 0.22 : 0.25 },
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
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
            ) : (
              <ImageUnavailableNotice />
            )}
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
              >
                {name}
              </Typography>
              {role ? (
                <Typography
                  variant="body-7"
                  as="p"
                  className="font-manrope font-normal text-white/85 line-clamp-2"
                >
                  {role}
                </Typography>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* BACK FACE (rotates -180 -> 0) — exact matching bounds with door opening animation */}
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
          transition={{
            rotateY: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.01, delay: flipped ? 0.25 : 0.22 },
          }}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Yellow Card Background matching front */}
          <div
            className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]"
          />

          {/* Back panel covering exact same bounds as data-card-image */}
          <div
            className={cx(
              "absolute inset-x-0 overflow-hidden rounded-md border border-[#E0D4AE]/50 shadow-sm",
              CARD_IMAGE_BOTTOM_INSET_CLASS,
              resolvedTopOffsetClass,
            )}
          >
            {/* Bio Content */}
            <div
              className={cx(
                "relative flex h-full w-full flex-col p-5 sm:p-6 overflow-hidden",
                BACK_PANEL_BG,
              )}
            >
              {/* Header: Name and Role */}
              <div className="flex-none pb-2.5 border-b border-white/15">
                <Typography
                  variant="body-2"
                  as="p"
                  className="font-manrope font-semibold text-white tracking-tight"
                >
                  {name}
                </Typography>
                {role ? (
                  <Typography
                    variant="body-7"
                    as="p"
                    className="font-manrope font-normal text-white/80 mt-0.5 line-clamp-2"
                  >
                    {role}
                  </Typography>
                ) : null}
              </div>

              {/* Bio / Description Paragraphs */}
              <div
                className={cx(
                  "mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1.5",
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
                      >
                        {paragraph}
                      </Typography>
                    ))
                  : null}
              </div>
            </div>

            {/* Left Sliding Door: Solid #FDE07F */}
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

            {/* Right Sliding Door: Solid #FDE07F */}
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