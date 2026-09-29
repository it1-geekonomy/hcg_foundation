"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const showImage = Boolean(img?.trim()) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [img]);

  const resolvedTopOffsetClass = topOffsetClass ?? DEFAULT_CARD_TOP_OFFSET_CLASS;

  const frontContent = (
    <div className="relative h-full w-full overflow-hidden rounded-md select-none">
      {/* Golden / Yellow Gradient Background */}
      <div
        data-yellow-bg
        className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]"
      />

      {/* Portrait Photo */}
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

      {/* Glassmorphic Front Label */}
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
            className="font-manrope font-semibold text-white truncate"
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
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82} className="rounded-md">
      <div
        className={cx(
          "relative h-full w-full flex flex-col p-5 sm:p-6 overflow-hidden rounded-md border border-[#E0D4AE]/50",
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
          {description && description.length > 0 ? (
            description.map((paragraph, i) => (
              <Typography
                key={i}
                variant="body-7"
                as="p"
                className="font-manrope leading-relaxed font-normal text-white/90"
              >
                {paragraph}
              </Typography>
            ))
          ) : (
            <Typography
              variant="body-7"
              as="p"
              className="font-manrope leading-relaxed font-normal text-white/70 italic"
            >
              Dedicated to supporting equitable healthcare and the mission of HCG Foundation.
            </Typography>
          )}
        </div>
      </div>
    </MirrorReveal>
  );

  return (
    <div
      ref={cardRef}
      data-card
      style={style}
      className={cx(
        "relative aspect-[320/380] flex-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      <FlipCard
        className="h-full w-full rounded-md"
        roundedClassName="rounded-md"
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
        flipOnHover={true}
        duration={0.45}
        returnDuration={0.75}
        front={frontContent}
        back={renderBackContent}
      />
    </div>
  );
}