"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  BACK_PANEL_GLASS_BG,
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
}: PersonCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const showImage = Boolean(img?.trim()) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [img]);

  useEffect(() => {
    if (!flipped) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cardRef.current && !cardRef.current.contains(target)) {
        setFlipped(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
    };
  }, [flipped]);

  const resolvedTopOffsetClass = topOffsetClass ?? DEFAULT_CARD_TOP_OFFSET_CLASS;

  return (
    <div
      ref={cardRef}
      className={cx(
        "relative aspect-[320/380] flex-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      <div
        className={cx("absolute inset-0 rounded-md", flipped && "pointer-events-none")}
      >
        <div className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]" />

        <div
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
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ImageUnavailableNotice />
          )}
        </div>

        <div
          ref={labelRef}
          style={labelHeight ? { minHeight: `${labelHeight}px` } : undefined}
          className={cx(
            "absolute inset-x-[0.875rem] bottom-[2.75rem] flex min-h-[5.25rem] items-center justify-between gap-3 rounded-xl px-4 py-3 transition-opacity duration-150 ease-out",
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
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(true);
            }}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white transition-transform hover:scale-105 active:scale-95"
          >
            <FlipIcon />
          </button>
        </div>
      </div>

      <div
        className={cx(
          "absolute inset-x-0 z-10 overflow-hidden rounded-md",
          CARD_IMAGE_BOTTOM_INSET_CLASS,
          resolvedTopOffsetClass,
          !flipped && "pointer-events-none",
        )}
      >
        <div
          className={cx(
            "absolute inset-0 transition-[clip-path] ease-out",
            flipped
              ? "[clip-path:inset(0%_0_0_0)] duration-[600ms]"
              : "[clip-path:inset(100%_0_0_0)] duration-[500ms]",
          )}
        >
          <div
            className={cx(
              "absolute inset-0 transition-opacity ease-in-out",
              BACK_PANEL_GLASS_BG,
              flipped ? "opacity-0 duration-[600ms]" : "opacity-100 duration-[500ms]",
            )}
          />
          <div
            className={cx(
              "absolute inset-0 transition-opacity ease-in-out",
              BACK_PANEL_BG,
              flipped ? "opacity-100 duration-[600ms]" : "opacity-0 duration-[500ms]",
            )}
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
              {description.map((paragraph, i) => (
                <Typography
                  key={i}
                  variant="body-7"
                  as="p"
                  className="font-manrope leading-relaxed font-normal text-white/90"
                >
                  {paragraph}
                </Typography>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
