"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Person = {
  name: string;
  role: string;
  img: string;
};

const trusteesRowOne: Person[] = [
  { name: "Dr. B.S. Ajaikumar", role: "Founder and Managing Trustee", img: "/Team/Ajaikumar.png" },
  { name: "Ms. Anjali Ajaikumar Bosai", role: "Trustee", img: "/Team/Anjali.png" },
  { name: "Dr. Ganesh Nayak", role: "Trustee", img: "/Team/Ganesh.png" },
];

const trusteesRowTwo: Person[] = [
  { name: "Dr. Ramesh S", role: "Trustee", img: "/Team/Ramesh.png" },
  { name: "Mr. Satish Khendoy", role: "Trustee", img: "/Team/Satish.png" },
];


const teamRow: Person[] = [
  { name: "Feros Khim", role: "Sr. Manager", img: "/Team/Feros.png" },
  { name: "Hari", role: "Patient Care Coordinator", img: "/Team/Hari.png" },
  { name: "Omkar Murthy", role: "Assistant Manager", img: "/Team/Omkar.png" },
  { name: "Renu Golani", role: "Region Spokesperson", img: "/Team/Renu.png" },
];


const CARD_W = 280; // only used for the next/image `sizes` attribute, not a class
const CARD_W_2XL = 340; // only used for the next/image `sizes` attribute, not a class
const BELOW_LG_CARD_WIDTH_CLASS = "w-[240px] sm:w-[260px]";

function PersonCard({
  name,
  role,
  img,
  widthClass,
}: Person & { widthClass?: string }) {
  return (
    <div
      className={[
        "relative aspect-[320/380] flex-none drop-shadow-[0_14px_30px_rgba(13,40,56,0.25)]",
        widthClass ?? "w-[280px] 2xl:w-[340px]",
      ].join(" ")}
    >
      {/* solid rect glow behind the photo: #FFE380 (opaque) fading to transparent, crisp edges */}
      <div className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]" />

      {/* cutout photo — shorter, pushed well up out of the top of the glow */}
      <div className="absolute -top-[60px] inset-x-0 bottom-[30px] overflow-hidden rounded-md">
        <Image
          src={img}
          alt={name}
          fill
          sizes={`(min-width: 1536px) ${CARD_W_2XL}px, ${CARD_W}px`}
          className="object-cover object-top grayscale"
        />
      </div>

      {/* glass label — anchored to the bottom edge of the photo, not the card, so it sits stuck onto the image */}
      <div className="absolute inset-x-[14px] bottom-[44px] z-10 flex items-center justify-between gap-3 rounded border border-white/15 bg-[linear-gradient(115deg,#FCCC2D_0%,#382B00_100%)] px-4 py-3 backdrop-blur-md">
        <div className="min-w-0">
          <p className="truncate text-sm sm:text-base font-semibold text-white">
            {name}
          </p>
          <p className="truncate text-xs sm:text-sm font-normal text-white/85">
            {role}
          </p>
        </div>
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 stroke-[#967300]"
          >
            <path d="M7 17L17 7M17 7H8M17 7V16" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className="flex h-10 w-10 flex-none touch-manipulation select-none items-center justify-center border-0 bg-transparent p-0 outline-none focus:bg-transparent active:bg-transparent disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={[
          "h-6 w-6 transition-colors",
          disabled ? "stroke-[#FCCC2D]/30" : "stroke-[#FCCC2D] hover:stroke-[#E3B400]",
        ].join(" ")}
      >
        {direction === "left" ? (
          <path d="M15 19l-7-7 7-7" />
        ) : (
          <path d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

function TeamCarousel({ people }: { people: Person[] }) {
  const visibleCount = 3;
  const gap = 24;
  const trackWidth = visibleCount * CARD_W + (visibleCount - 1) * gap;
  const step = CARD_W + gap;

  const maxIndex = Math.max(0, people.length - visibleCount);
  const [index, setIndex] = useState(0);

  const atStart = index === 0;
  const atEnd = index >= maxIndex;
  const needsCarousel = people.length > visibleCount;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div className="mx-auto flex w-fit max-w-full items-center gap-2">
      {needsCarousel && (
        <ArrowButton direction="left" disabled={atStart} onClick={goPrev} />
      )}

      {/* clip-path (not overflow-hidden) so only left/right are clipped for the
          slide — the photo's upward peek above each card stays visible instead
          of getting cut off and exposing the glow layer behind it */}
      <div
        style={{
          width: trackWidth,
          maxWidth: "100%",
          clipPath: "inset(-80px 0px 0px 0px)",
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap,
            transform: `translateX(-${index * step}px)`,
          }}
        >
          {people.map((p) => (
            <PersonCard key={p.name} {...p} />
          ))}
        </div>
      </div>

      {needsCarousel && (
        <ArrowButton direction="right" disabled={atEnd} onClick={goNext} />
      )}
    </div>
  );
}

function ArrowScrollCarousel({ people }: { people: Person[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(people.length <= 1);

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card ? card.offsetWidth + 16 /* matches gap-4 below */ : el.clientWidth;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1260px] items-center gap-1">
      <ArrowButton direction="left" disabled={atStart} onClick={() => scrollByCard(-1)} />

      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className={[
          "flex min-w-0 flex-1 gap-4 overflow-x-auto scroll-smooth snap-x",
          "pt-16 pb-2",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        {people.map((p) => (
          <div key={p.name} data-card className="flex-none snap-center">
            <PersonCard {...p} widthClass={BELOW_LG_CARD_WIDTH_CLASS} />
          </div>
        ))}
      </div>

      <ArrowButton direction="right" disabled={atEnd} onClick={() => scrollByCard(1)} />
    </div>
  );
}

export default function TeamSection() {
  const allTrustees = [...trusteesRowOne, ...trusteesRowTwo];

  return (
    <section className="bg-[#FFF6D8] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-10 xl:py-20 lg:px-6 xl:px-6">
      {/* header */}
      <div className="mx-auto mb-12 flex flex-col gap-5 md:mb-16 md:flex-row md:items-start md:justify-between md:gap-[60px] 2xl:px-40">
        <div className="flex items-stretch gap-5">
          <span className="w-[3px] flex-none rounded-full bg-[#FCCC2D]" />
          <h1 className="max-w-[460px] font-serif text-[28px] italic leading-[1.25] text-[#382E07] md:text-[38px]">
            Meet the People
            <br />
            Behind the Mission
          </h1>
        </div>
        <p className="max-w-[300px] text-sm leading-[1.7] text-[#596D79]">
          A dedicated team working together to advance cancer awareness,
          support patients, and build healthier communities through
          compassion, collaboration, and meaningful impact.
        </p>
      </div>

      {/* "Trustees" divider */}
      <div className="mx-auto mb-14 flex max-w-[1260px] items-center justify-center gap-4 md:mb-[72px] md:gap-[22px]">
        <span className="h-px w-full max-w-[60px] bg-gradient-to-l from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[260px]" />
        <span className="whitespace-nowrap font-serif text-[15px] italic tracking-[0.02em] text-[#382E07]">
          Trustees
        </span>
        <span className="h-px w-full max-w-[60px] bg-gradient-to-r from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[260px]" />
      </div>

      {/*
        TRUSTEES — below lg:
        Simple flex-wrap of fixed-width cards (BELOW_LG_CARD_WIDTH_CLASS,
        shared with the team carousel so sizes always match exactly).
        flex-wrap + justify-center on equal-width children auto-centers any
        incomplete last row (3+2, 3+3, 3+3+1, ...) as more trustees are
        added — no per-count logic needed. Margin below is intentionally
        small (mb-8) to keep the trustees and team members visually close.
      */}
      <div className="mx-auto mb-8 flex max-w-[1260px] flex-wrap justify-center gap-4 lg:hidden">
        {allTrustees.map((p) => (
          <PersonCard key={p.name} {...p} widthClass={BELOW_LG_CARD_WIDTH_CLASS} />
        ))}
      </div>

      {/* TRUSTEES — lg and above: original two fixed rows, unchanged, now hidden below lg */}
      <div className="mx-auto mb-16 hidden max-w-[1260px] flex-wrap justify-center gap-[30px] md:mb-20 lg:flex">
        {trusteesRowOne.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>

      <div className="mx-auto mb-16 hidden max-w-[1260px] flex-wrap justify-center gap-[30px] md:mb-24 lg:flex">
        {trusteesRowTwo.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>

      {/*
        TEAM MEMBERS — below lg:
        Arrow carousel with fixed-width cards matching the trustee size
        exactly. Arrows scroll by one card's rendered width at a time.
      */}
      <div className="lg:hidden">
        <ArrowScrollCarousel people={teamRow} />
      </div>

      {/* TEAM MEMBERS — lg & xl only: original fixed carousel, unchanged */}
      <div className="hidden lg:block 2xl:hidden">
        <TeamCarousel people={teamRow} />
      </div>

      {/* TEAM MEMBERS — 2xl and above: unchanged — full 4-column grid, no carousel */}
      <div className="hidden 2xl:grid grid-cols-4 justify-items-center gap-30 3xl:gap-20 px-20 3xl:px-50">
        {teamRow.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>
    </section>
  );
}