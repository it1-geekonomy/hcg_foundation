"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import {
  BACK_PANEL_BG,
  CARD_GRADIENT_BG,
  CARD_W,
  CARD_W_2XL,
  type Person,
} from "@/domains/about/constants/teams";
import { ImageUnavailableNotice } from "../shared/ImageUnavailableNotice";
import { FlipIcon } from "./TeamIcons";
import {
  CARD_IMAGE_BOTTOM_INSET_CLASS,
  DEFAULT_CARD_TOP_OFFSET_CLASS,
  DEFAULT_CARD_WIDTH_CLASS,
  cx,
} from "./team-utils";

const OPEN_DURATION_MS = 600;
const CLOSE_DURATION_MS = 500;

/** Glass flash without backdrop-blur — blur during transform causes flicker. */
const BACK_PANEL_GLASS_FLASH =
  "bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)]";

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
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animTimerRef = useRef<number | null>(null);
  const showImage = Boolean(img?.trim()) && !imageFailed;

  const durationMs = flipped ? OPEN_DURATION_MS : CLOSE_DURATION_MS;

  const runFlip = useCallback((next: boolean) => {
    if (animTimerRef.current != null) {
      window.clearTimeout(animTimerRef.current);
    }
    setAnimating(true);
    setFlipped(next);
    animTimerRef.current = window.setTimeout(() => {
      setAnimating(false);
      animTimerRef.current = null;
    }, next ? OPEN_DURATION_MS : CLOSE_DURATION_MS);
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [img]);

  useEffect(() => {
    return () => {
      if (animTimerRef.current != null) {
        window.clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!flipped) return;

    const handleAnyClick = () => {
      runFlip(false);
    };

    // Defer so the open-button click that flipped the card doesn't also close it.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", handleAnyClick, true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", handleAnyClick, true);
    };
  }, [flipped, runFlip]);

  const resolvedTopOffsetClass = topOffsetClass ?? DEFAULT_CARD_TOP_OFFSET_CLASS;

  const panelTransitionStyle: CSSProperties = {
    transitionProperty: "transform, opacity",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      ref={cardRef}
      style={style}
      className={cx(
        "relative aspect-[320/380] flex-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      {/* FRONT */}
      <div
        className={cx(
          "absolute inset-0 rounded-md",
          flipped && "pointer-events-none",
        )}
      >
        <div
          data-yellow-bg
          className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]"
        />

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
              className="object-cover object-top"
              unoptimized={/^https?:\/\//i.test(img)}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ImageUnavailableNotice />
          )}
        </div>

        <div
          ref={labelRef}
          style={{
            ...(labelHeight ? { minHeight: `${labelHeight}px` } : undefined),
            transitionProperty: "opacity",
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: "ease-out",
          }}
          className={cx(
            "absolute inset-x-[0.875rem] bottom-[2.75rem] flex min-h-[5.25rem] items-center justify-between gap-3 rounded-xl px-4 py-3",
            flipped ? "opacity-0" : "opacity-100",
            CARD_GRADIENT_BG,
          )}
        >
          <div className="min-w-0">
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
                className="font-manrope font-normal text-white/85"
              >
                {role}
              </Typography>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={`Show details for ${name}`}
            disabled={animating}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              runFlip(true);
            }}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none"
          >
            <FlipIcon />
          </button>
        </div>
      </div>

      {/* BACK — GPU transform slide; avoids clip-path flicker */}
      <div
        className={cx(
          "absolute inset-x-0 z-10 overflow-hidden rounded-md",
          CARD_IMAGE_BOTTOM_INSET_CLASS,
          resolvedTopOffsetClass,
          !flipped && "pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            ...panelTransitionStyle,
            transform: flipped
              ? "translate3d(0, 0, 0)"
              : "translate3d(0, 100%, 0)",
          }}
        >
          <div
            className={cx("absolute inset-0", BACK_PANEL_GLASS_FLASH)}
            style={{
              ...panelTransitionStyle,
              opacity: flipped ? 0 : 1,
            }}
          />

          <div
            className={cx("absolute inset-0", BACK_PANEL_BG)}
            style={{
              ...panelTransitionStyle,
              opacity: flipped ? 1 : 0,
            }}
          />

          <div className="relative flex h-full flex-col p-5">
            <Typography
              variant="body-2"
              as="p"
              className="flex-none font-manrope font-semibold text-white"
            >
              {name}
            </Typography>

            <div
              className={cx(
                "mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2",
                "[scrollbar-width:none]",
                "[-ms-overflow-style:none]",
                "[&::-webkit-scrollbar]:hidden",
              )}
            >
              {description.length > 0
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
        </div>
      </div>
    </div>
  );
}
