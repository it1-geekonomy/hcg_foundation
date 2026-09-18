"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import type { AwardItem } from "@/domains/about/constants/awards";
import { ImageUnavailableNotice } from "../shared/ImageUnavailableNotice";

export function AwardCard({
  award,
  titleHeight,
  titleRef,
}: {
  award: AwardItem;
  titleHeight?: number | null;
  titleRef?: (el: HTMLDivElement | null) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(award.image?.trim()) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [award.image]);

  return (
    <div data-award-card className="min-w-0 w-full">
      <div
        data-award-image
        className="relative mx-auto aspect-[4/5] w-[80%] overflow-hidden sm:mx-0 sm:w-full"
      >
        {showImage ? (
          <Image
            src={award.image}
            alt={award.title || "Award"}
            fill
            sizes="(max-width: 640px) 80vw, 45vw"
            className="object-cover"
            unoptimized={/^https?:\/\//i.test(award.image)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageUnavailableNotice />
        )}
      </div>

      <div className="min-w-0 w-full">
        <div
          className="mt-4 flex items-start justify-center overflow-hidden"
          style={titleHeight != null ? { height: `${titleHeight}px` } : undefined}
        >
          <div ref={titleRef}>
            {award.title ? (
              <Typography
                variant="heading-9"
                as="h3"
                className="break-words text-center font-argestadisplay text-[#000910]"
              >
                {award.title}
              </Typography>
            ) : null}
          </div>
        </div>

        {award.description ? (
          <Typography
            variant="body-9"
            as="p"
            className="mt-4 break-words text-center font-manrope font-normal text-[#293239] sm:mt-8"
          >
            {award.description}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
