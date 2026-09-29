"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Typography from "@/lib/Typography";
import {
  ART_GALLERY_CARDS,
  FADE_GRADIENT,
} from "@/domains/ourprograms/Swasthigallery/constants/artgallery";
import GallerySection from "./gallerysection";

function Card({
  icon,
  title,
  description,
  showMobileDivider = false,
  visible,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  showMobileDivider?: boolean;
  visible: boolean;
  index: number;
}) {
  const delay = index * 140;
  const fromX = index % 2 === 0 ? -50 : 50; // alternate entry sides

  return (
    <div
      style={{
        ["--delay" as string]: `${delay}ms`,
        ["--fx" as string]: `${fromX}px`,
      }}
      className={`swasti-card min-w-0 p-6 sm:p-8 lg:p-6 xl:p-10 ${
        visible ? "is-visible" : ""
      } ${showMobileDivider ? "border-b border-[#FFECC5] sm:border-b-0" : ""}`}
    >
      <span className="swasti-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEF0D3] sm:h-14 sm:w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20">
        <Image
          src={icon}
          alt=""
          width={32}
          height={32}
          className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
        />
      </span>

      <Typography
        variant="heading-8"
        as="h3"
        className="swasti-title mt-4 font-argestadisplay font-normal text-black"
      >
        {title}
      </Typography>

      <Typography
        variant="body-7"
        as="p"
        className="swasti-desc mt-2 font-manrope font-normal text-[#606060]"
      >
        {description}
      </Typography>
    </div>
  );
}

function VerticalDivider() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 z-[4] hidden w-px -translate-x-1/2 sm:block"
      style={{
        backgroundColor: "rgba(133,125,106,0.35)",
        maskImage: `linear-gradient(to bottom, ${FADE_GRADIENT})`,
        WebkitMaskImage: `linear-gradient(to bottom, ${FADE_GRADIENT})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}

function HorizontalDivider() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 z-[4] hidden h-px -translate-y-1/2 sm:block"
      style={{
        backgroundColor: "rgba(133,125,106,0.35)",
        maskImage: `linear-gradient(to right, ${FADE_GRADIENT})`,
        WebkitMaskImage: `linear-gradient(to right, ${FADE_GRADIENT})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}

export default function SwastiArtGallery() {
  const cards = ART_GALLERY_CARDS;

  const cardsRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] pt-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40">
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-2 xl:gap-10 2xl:gap-20">
        {/* Left: heading, paragraphs, email */}
        <div className="min-w-0">
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline text-[#382E07] font-normal"
          >
            A Space Where
            <br className="hidden lg:block" /> Art Heals
          </Typography>

          <div className="mt-6 space-y-5">
            <Typography variant="body-2" as="p" className="font-normal font-argestadisplay text-[#293239]">
              Swasti Art Gallery, an initiative of the HCG Foundation, is a creative care unit with
              galleries at HCG&apos;s main hospital in Bangalore and other HCG facilities across India.
              Launched in 2007, Swasti promotes art and raises funds to support cancer patients.
            </Typography>
            <Typography variant="body-2" as="p" className="font-normal font-argestadisplay text-[#293239]">
              The gallery creates a positive environment for patients and families while hosting art
              shows, camps, workshops, and art therapy events with artists from across India and abroad.
            </Typography>
            <Typography variant="body-2" as="p" className="font-normal font-argestadisplay text-[#293239]">
              Swasti also provides a platform for artists and art lovers by showcasing quality artwork
              and promoting emerging and established talent.
            </Typography>
          </div>

          <Typography variant="body-2" as="p" className="mt-6 font-normal font-argestadisplay text-[#293239]">
            Email:{" "}
            <Link href="mailto:swasthigallery@gmail.com">
              swasthigallery@gmail.com
            </Link>
          </Typography>
        </div>

        {/* Right: animated 2x2 icon card grid */}
        <div
          ref={cardsRef}
          className="relative min-w-0 overflow-hidden border border-[#FFECC5] bg-[#FFFBEE]"
        >
          <div className="relative z-[1] grid grid-cols-1 sm:grid-cols-2">
            <Card {...cards[0]} showMobileDivider visible={visible} index={0} />
            <Card {...cards[1]} showMobileDivider visible={visible} index={1} />
            <Card {...cards[2]} showMobileDivider visible={visible} index={2} />
            <Card {...cards[3]} visible={visible} index={3} />
          </div>
          <VerticalDivider />
          <HorizontalDivider />
        </div>
      </div>
      <GallerySection />
    </section>
  );
}