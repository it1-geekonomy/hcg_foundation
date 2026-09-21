"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Typography from "@/lib/Typography";

import {
  SCREENING_IMAGES,
  STUDENT_IMAGES,
  PAGE_SIZE_MOBILE,
  PAGE_SIZE_DESKTOP,
  SM_BREAKPOINT,
} from "@/domains/ourprograms/AwarenessAndScreening/constants/screening";

type GalleryImage = { id: string; src: string; alt: string };

function splitIntoTwoRows(images: GalleryImage[]): [GalleryImage[], GalleryImage[]] {
  if (images.length <= 1) return [images, []];
  const row1Count = Math.ceil(images.length / 2);
  return [images.slice(0, row1Count), images.slice(row1Count)];
}
function useIsSmUp() {
  const [isSmUp, setIsSmUp] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(SM_BREAKPOINT);
    const handleChange = (e: MediaQueryListEvent) => setIsSmUp(e.matches);
    setIsSmUp(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isSmUp;
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Show previous set of images" : "Show next set of images"}
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:h-7 sm:w-7"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}
function GalleryTile({
  image,
  fullWidth = false,
}: {
  image: GalleryImage;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`relative aspect-[4/3] shrink-0 overflow-hidden rounded-sm ${fullWidth
          ? "w-full"
          : "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)]"
        }`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={fullWidth ? "100vw" : "(min-width: 640px) 33vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}

function ScreeningGrid() {
  const isSmUp = useIsSmUp();
  const pageSize = isSmUp ? PAGE_SIZE_DESKTOP : 1;
  const maxStart = Math.max(0, SCREENING_IMAGES.length - pageSize);
  const [windowStart, setWindowStart] = useState(0);
  useEffect(() => {
    setWindowStart((s) => Math.min(Math.max(0, s), maxStart));
  }, [maxStart]);

  const currentSet = useMemo(
    () => SCREENING_IMAGES.slice(windowStart, windowStart + pageSize),
    [windowStart, pageSize]
  );
  const [row1, row2] = useMemo(() => splitIntoTwoRows(currentSet), [currentSet]);

  const canGoPrev = windowStart > 0;
  const canGoNext = windowStart < maxStart;
  const showArrows = maxStart > 0;
  const goPrev = () => setWindowStart((s) => Math.max(0, s - pageSize));
  const goNext = () => setWindowStart((s) => Math.min(maxStart, s + pageSize));

  // Swipe / drag support
  const touchStartX = useState({ x: 0 })[0];
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.x = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.x;
    const SWIPE_THRESHOLD = 40;
    if (deltaX > SWIPE_THRESHOLD && canGoPrev) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD && canGoNext) goNext();
  };

  const isMobileSingle = !isSmUp && pageSize === 1;

  return (
    <div className="flex w-full items-center gap-1">
      {showArrows && <ArrowButton direction="left" onClick={goPrev} disabled={!canGoPrev} />}

      <div
        className="flex min-w-0 flex-1 flex-col gap-4 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-wrap justify-center gap-4">
          {row1.map((image) => (
            <GalleryTile key={image.id} image={image} fullWidth={isMobileSingle} />
          ))}
        </div>
        {row2.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {row2.map((image) => (
              <GalleryTile key={image.id} image={image} fullWidth={isMobileSingle} />
            ))}
          </div>
        )}
      </div>

      {showArrows && <ArrowButton direction="right" onClick={goNext} disabled={!canGoNext} />}
    </div>
  );
}

function StudentOutreachGrid() {
  const [first, second, third] = STUDENT_IMAGES;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
        <Image
          src={first.src}
          alt={first.alt}
          fill
          className="object-cover"
        />
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
        <Image
          src={second.src}
          alt={second.alt}
          fill
          className="object-cover"
        />
      </div>
      <div className="relative col-span-2 aspect-[4/3] w-1/2 justify-self-center overflow-hidden rounded-sm sm:col-span-1 sm:w-full">
        <Image
          src={third.src}
          alt={third.alt}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

export default function CancerScreeningSection() {
  return (
    <section className="w-full overflow-x-hidden bg-[#FFFCF1] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:py-14 lg:px-6 xl:py-20 xl:px-6 2xl:px-40">
      {/* Mobile Screening */}
      <div className="w-full">
        <Typography
          variant="heading-7"
          as="h3"
          className="font-tiempos-headline font-normal text-[#382E07]"
        >
          Mobile Screening
        </Typography>

        <Typography
          variant="body-2"
          as="p"
          className="mt-2 font-argestadisplay font-normal text-[#293239]"
        >
          Bringing cancer screening closer to communities, HCG Foundation’s mobile screening initiative takes essential diagnostic services directly to underserved and remote areas. Equipped with healthcare professionals and screening facilities, the mobile unit supports early detection, raises cancer awareness, and helps people access timely screening closer to home.
        </Typography>

        <div className="mt-6">
          <ScreeningGrid />
        </div>
      </div>

      {/* Student Outreach */}
      <div className="mt-12 w-full lg:mt-16">
        <Typography
          variant="heading-7"
          as="h3"
          className="font-tiempos-headline font-normal text-[#382E07]"
        >
          Student Outreach
        </Typography>

        <div className="mt-2 space-y-4">
          <Typography
            variant="body-2"
            as="p"
            className="font-argestadisplay font-normal text-[#293239]"
          >
            Since 2018, HCG Foundation has conducted healthy habits campaigns for 4th, 5th, and 6th-grade students in government schools. The program includes interactive sessions on nutrition, yoga, art, HPV vaccination, and conversations with healthcare professionals, helping students understand healthy lifestyle choices, peer pressure, substance abuse, and the importance of maintaining a balanced diet.
          </Typography>

          <Typography
            variant="body-2"
            as="p"
            className="font-argestadisplay font-normal text-[#293239]"
          >
            The initiative aims to build healthy habits and awareness from an early age, empowering children with practical knowledge that can support their physical, emotional, and overall well-being.
          </Typography>
        </div>

        <div className="mt-6">
          <StudentOutreachGrid />
        </div>
      </div>
    </section>
  );
}