"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import type { AwardItem } from "@/domains/about/constants/awards";

import { AwardLens, useAwardLens } from "./awardLens";

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

  const { boxRef, lensRef, innerRef, handleMove, handleLeave } = useAwardLens();

  useEffect(() => {
    setImageFailed(false);
  }, [award.image]);

  /* ---------- Text-only blur reveal (plays once) ---------- */
  const textRef = useRef<HTMLDivElement | null>(null);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setTextVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const reveal = `transition-[opacity,filter] duration-[800ms] ease-out motion-reduce:opacity-100 motion-reduce:blur-0 motion-reduce:transition-none ${
    textVisible ? "opacity-100 blur-0" : "opacity-0 blur-[14px]"
  }`;

  return (
    <div
      data-award-card
      className="mx-auto w-full max-w-[280px] max-[500px]:max-w-none sm:max-w-[460px]"
    >
      <div
        ref={boxRef}
        data-award-image
        onPointerMove={showImage ? handleMove : undefined}
        onPointerLeave={showImage ? handleLeave : undefined}
        className="relative aspect-[4/5] w-full overflow-hidden"
      >
        {showImage ? (
          <>
            <Image
              src={award.image}
              alt={award.title || "Award"}
              fill
              sizes="(max-width: 500px) 100vw, (max-width: 640px) 280px, 460px"
              className="object-cover"
              unoptimized={/^https?:\/\//i.test(award.image)}
              onError={() => setImageFailed(true)}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />

            <AwardLens
              image={award.image}
              lensRef={lensRef}
              innerRef={innerRef}
            />
          </>
        ) : null}
      </div>

      <div ref={textRef} className="min-w-0 w-full">
        <div
          className="mt-4 flex items-start justify-center overflow-hidden"
          style={titleHeight != null ? { height: `${titleHeight}px` } : undefined}
        >
          <div ref={titleRef}>
            {award.title ? (
              <Typography
                variant="heading-9"
                as="h3"
                className={`break-words text-center font-argestadisplay text-[#000910] ${reveal}`}
              >
                {award.title}
              </Typography>
            ) : null}
          </div>
        </div>

        {award.description ? (
          <>
            <Typography
              variant="body-7"
              as="p"
              className={`mt-4 block break-words text-center font-manrope font-normal text-[#293239] sm:mt-8 lg:hidden delay-150 ${reveal}`}
            >
              {award.description}
            </Typography>
            <Typography
              variant="body-9"
              as="p"
              className={`mt-4 hidden break-words text-center font-manrope font-normal text-[#293239] sm:mt-8 lg:block delay-150 ${reveal}`}
            >
              {award.description}
            </Typography>
          </>
        ) : null}
      </div>
    </div>
  );
}