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
function GalleryTile({ image }: { image: GalleryImage }) {
  return (
    <div className="relative aspect-[4/3] w-[calc((100%-1rem)/2)] shrink-0 overflow-hidden rounded-sm sm:w-[calc((100%-2rem)/3)]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 640px) 33vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

function ScreeningGrid() {
  const isSmUp = useIsSmUp();
  const pageSize = isSmUp ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE;
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

  return (
    <div className="flex w-full items-center gap-1">
      {showArrows && <ArrowButton direction="left" onClick={goPrev} disabled={!canGoPrev} />}

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-4">
          {row1.map((image) => (
            <GalleryTile key={image.id} image={image} />
          ))}
        </div>
        {row2.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {row2.map((image) => (
              <GalleryTile key={image.id} image={image} />
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
          In 2014, the HCG Foundation, in partnership with the Infosys Foundation, launched a mobile
          cancer bus. Staffed with a doctor, nurse, and paramedical staff, the clinic is equipped with
          mammography, x-ray, ultrasound, pathology, and lab facilities. The mobile clinic serves remote
          areas in north Karnataka, providing advanced cancer screening and early diagnosis. It also
          educates the public about cancer through visual aids inside and outside the clinic.
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

        <Typography
          variant="body-2"
          as="p"
          className="mt-2 font-argestadisplay font-normal text-[#293239]"
        >
          Since 2018, the HCG Foundation has conducted a healthy habits campaign for 4th, 5th, and 6th
          graders in government schools. The program includes sessions on nutrition, yoga, art, and
          interactions with healthcare professionals, aiming to teach students about peer pressure,
          substance abuse, and the importance of a balanced life.
        </Typography>

        <div className="mt-6">
          <StudentOutreachGrid />
        </div>
      </div>
    </section>
  );
}