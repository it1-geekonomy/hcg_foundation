"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import {
  BACK_PANEL_BG,
  CARD_GRADIENT_BG,
  CARD_W,
  CARD_W_2XL,
  DUMMY_DESCRIPTION,
  SM_FLUID_CARD_WIDTH,
  trusteesRowOne,
  trusteesRowTwo,
  teamRow,
  XS_FIXED_CARD_WIDTH,
  type Person,
} from "@/domains/about/constants/teams";

const BACK_PANEL_GLASS_BG =
  "bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)] backdrop-blur-lg";

// How long the reveal (bottom -> top) takes when opening / closing.
// NOTE: Tailwind's utility classes are resolved statically at build time,
// so these values can't be read into `duration-[...]` classes at runtime.
// The numbers below and the `duration-[600ms]` / `duration-[500ms]`
// classes used in PersonCard's back panel must be kept in sync manually.
const OPEN_DURATION_MS = 600;
const CLOSE_DURATION_MS = 500;

// The glass -> solid crossfade runs for the full open duration, in sync
// with the clip-path reveal, so the color blends in continuously as the
// panel grows rather than snapping at some point partway through.
// (Mirrors OPEN_DURATION_MS — see the `duration-[600ms]` classes below.)
const CROSSFADE_DURATION_MS = OPEN_DURATION_MS;

// Card / image sizing — expressed with clamp() and rem instead of raw px
// or stepped breakpoints, so the card and its image scale fluidly with
// the viewport rather than snapping between fixed sizes.
const DEFAULT_CARD_WIDTH_CLASS = "w-[clamp(17.5rem,20vw,21.25rem)]"; // 280px – 340px
const DEFAULT_CARD_TOP_OFFSET_CLASS =
  "-top-[clamp(1.875rem,6vw,3.75rem)]"; // 30px – 60px
const CARD_IMAGE_BOTTOM_INSET_CLASS = "bottom-[1.875rem]"; // 30px

/** Joins truthy class fragments together, dropping falsy ones. */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function FlipIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("h-4 w-4 stroke-[#967300]", back && "rotate-[225deg]")}
    >
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  );
}

function PersonCard({
  name,
  role,
  img,
  widthClass,
  // NOTE: these three flags are accepted (and passed by callers) but are
  // currently not wired to any visual behavior below — kept as-is to
  // avoid changing behavior; flagged here for a future pass.
  fadeBottom = false,
  wrapLabel = false,
  dropShadow = true,
  topOffsetClass,
  description = DUMMY_DESCRIPTION,
}: Person & {
  widthClass?: string;
  fadeBottom?: boolean;
  wrapLabel?: boolean;
  dropShadow?: boolean;
  topOffsetClass?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      {/* FRONT */}
      <div className={cx("absolute inset-0 rounded-md", flipped && "pointer-events-none")}>
        <div className="absolute inset-0 rounded-md bg-[linear-gradient(to_bottom,_#FFE380_0%,_rgba(255,255,255,0)_100%)]" />

        {/* IMAGE — fluid width via clamp(), no fixed-px breakpoints */}
        <div
          className={cx(
            "absolute inset-x-0 overflow-hidden rounded-md",
            CARD_IMAGE_BOTTOM_INSET_CLASS,
            resolvedTopOffsetClass,
          )}
        >
          <Image
            src={img}
            alt={name}
            fill
            sizes={`(min-width: 1536px) ${CARD_W_2XL}px, ${CARD_W}px`}
            className="object-cover object-top"
          />
        </div>

        {/* LABEL */}
        <div
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
              className="font-semibold font-manrope text-white"
            >
              {name}
            </Typography>

            <Typography
              variant="body-7"
              as="p"
              className="font-normal font-manrope text-white/85"
            >
              {role}
            </Typography>
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

      {/* BACK */}
      <div
        className={cx(
          "absolute inset-x-0 z-10 overflow-hidden rounded-md",
          CARD_IMAGE_BOTTOM_INSET_CLASS,
          resolvedTopOffsetClass,
          !flipped && "pointer-events-none",
        )}
      >
        {/* REVEALED PANEL — grows bottom -> top via clip-path so text
            doesn't stretch like it would with a scaleY transform.
            Background + content live together inside, so content is
            visible progressively as the panel grows, not delayed.
            Durations below must match OPEN_DURATION_MS / CLOSE_DURATION_MS. */}
        <div
          className={cx(
            "absolute inset-0 transition-[clip-path] ease-out",
            flipped
              ? "[clip-path:inset(0%_0_0_0)] duration-[600ms]"
              : "[clip-path:inset(100%_0_0_0)] duration-[500ms]",
          )}
        >
          {/* GLASS LAYER — fades out smoothly across the whole grow,
              in sync with the clip-path reveal */}
          <div
            className={cx(
              "absolute inset-0 transition-opacity ease-in-out",
              BACK_PANEL_GLASS_BG,
              flipped ? "opacity-0 duration-[600ms]" : "opacity-100 duration-0",
            )}
          />

          {/* SOLID LAYER — fades in smoothly across the whole grow,
              finishing right as the panel finishes growing */}
          <div
            className={cx(
              "absolute inset-0 transition-opacity ease-in-out",
              BACK_PANEL_BG,
              flipped ? "opacity-100 duration-[600ms]" : "opacity-0 duration-0",
            )}
          />

          {/* CONTENT — sits at full, real size the whole time; the
              clip-path on the parent is what reveals it bottom -> top */}
          <div className="relative flex h-full flex-col p-5">
            <Typography
              variant="body-2"
              as="p"
              className="flex-none font-semibold font-manrope text-white"
            >
              {name}
            </Typography>

            {/* PARAGRAPHS — works for 1 or many */}
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
                  className="font-normal font-manrope leading-relaxed text-white/90"
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
      className="flex h-10 w-10 flex-none touch-manipulation select-none items-center justify-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:bg-transparent active:bg-transparent disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx(
          "h-6 w-6 transition-colors",
          disabled
            ? "stroke-[#FCCC2D]/30"
            : "stroke-[#FCCC2D] hover:stroke-[#E3B400]",
        )}
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

/* =========================================================
   LG — FIXED TEAM CAROUSEL
========================================================= */

// Matches the track's `gap-6` utility (1.5rem = 24px). Kept as a number
// because it feeds the pixel arithmetic below (trackWidth/step), which
// is inherently dynamic (derived from the imported CARD_W token and from
// carousel state) and so can't be expressed as static Tailwind classes.
const CAROUSEL_GAP_PX = 24;

// The lg/xl carousel relies on every card being exactly CARD_W wide so
// that trackWidth/step (pixel math below) stay in sync with what's
// actually rendered. PersonCard's own default width is a fluid
// clamp() that does NOT resolve to CARD_W at every viewport size, so
// cards here must be pinned to this fixed width explicitly — otherwise
// the real rendered track width drifts from `--track-w` and the
// `overflow-hidden` wrapper silently clips the last card.
const FIXED_CARD_WIDTH_CLASS = `w-[${CARD_W}px]`;

function TeamCarousel({ people }: { people: Person[] }) {
  const visibleCount = 3;
  const trackWidth = visibleCount * CARD_W + (visibleCount - 1) * CAROUSEL_GAP_PX;
  const step = CARD_W + CAROUSEL_GAP_PX;

  const maxIndex = Math.max(0, people.length - visibleCount);
  const [index, setIndex] = useState(0);

  const atStart = index === 0;
  const atEnd = index >= maxIndex;
  const needsCarousel = people.length > visibleCount;

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    setIndex((i) => Math.min(maxIndex, i + 1));
  };

  return (
    <div className="mx-auto flex w-fit max-w-full items-center gap-2">
      {needsCarousel && (
        <ArrowButton direction="left" disabled={atStart} onClick={goPrev} />
      )}

      {/*
        FIX: was using `clipPath: inset(-80px 0px 0px 0px)` here.
        clip-path only clips PAINT, not layout — so the off-screen
        cards in the flex row below still counted toward the page's
        scrollable width, causing a horizontal scrollbar and the
        blank space on the right at lg/xl widths.

        Replaced with `overflow-hidden` (which actually clips layout
        overflow) combined with `-mt-20 pt-20` (-80px / +80px) so the
        box's edges land in exactly the same place as the old
        clip-path did — same visual bleed above the cards, same
        bottom edge, same left/right edges — just properly clipped
        now instead of only visually hidden.

        `--track-w` / `--track-x` are the only values here that
        genuinely can't be static Tailwind classes: they're computed
        from the imported CARD_W token and from live carousel state.
        Everything else is a plain utility class.
      */}
      <div
        className="-mt-20 w-[var(--track-w)] max-w-full overflow-hidden pt-20"
        style={{ "--track-w": `${trackWidth}px` } as CSSProperties}
      >
        <div
          className="flex translate-x-[var(--track-x)] gap-6 transition-transform duration-500 ease-out"
          style={{ "--track-x": `-${index * step}px` } as CSSProperties}
        >
          {people.map((p) => (
            <PersonCard key={p.name} {...p} widthClass={FIXED_CARD_WIDTH_CLASS} />
          ))}
        </div>
      </div>

      {needsCarousel && (
        <ArrowButton direction="right" disabled={atEnd} onClick={goNext} />
      )}
    </div>
  );
}

/* =========================================================
   BELOW LG TEAM CAROUSEL
========================================================= */

// Fallback amount (px) added to a card's measured width when estimating
// scroll distance — matches the desktop `gap-4` utility (1rem = 16px)
// used on the track below.
const MOBILE_CARD_GAP_PX = 16;

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

    const onResize = () => {
      updateEdges();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;

    if (!el) return;

    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card ? card.offsetWidth + MOBILE_CARD_GAP_PX : el.clientWidth;

    el.scrollBy({
      left: dir * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cx(
        "mx-auto flex w-full max-w-[1260px] items-center gap-1",

        // BELOW 640px ONLY: cancel the section's px-8 so the arrows can
        // use that space, and keep them directly beside the fixed-width
        // card, centering the whole (arrow + card + arrow) group.
        "max-sm:-mx-8",
        "max-sm:w-[calc(100%+4rem)]",
        "max-sm:gap-0",
        "max-sm:justify-center",
      )}
    >
      {/* LEFT ARROW */}
      <ArrowButton direction="left" disabled={atStart} onClick={() => scrollByCard(-1)} />

      {/* CARD VIEWPORT */}
      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className={cx(
          // 640px+: existing behavior
          "min-w-0 flex-1 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-9 pb-2",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",

          // BELOW 640px ONLY: fixed width, matches the Trustees cards
          "max-sm:w-[16.25rem]",
          "max-sm:flex-none",
          "max-sm:pt-9",
          "max-sm:pb-0",
        )}
      >
        <div className={cx("flex gap-4", "max-sm:gap-0")}>
          {people.map((p) => (
            <div
              key={p.name}
              data-card
              className={cx(
                "flex-none snap-center sm:snap-start",
                "max-sm:w-[16.25rem]", // BELOW 640px: fixed, matches Trustees
                "w-full", // 640px+: existing fluid width
                SM_FLUID_CARD_WIDTH,
              )}
            >
              <PersonCard
                {...p}
                widthClass="w-full"
                fadeBottom
                wrapLabel
                dropShadow={false}
                topOffsetClass="-top-[clamp(1.25rem,6vw,1.875rem)]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT ARROW */}
      <ArrowButton direction="right" disabled={atEnd} onClick={() => scrollByCard(1)} />
    </div>
  );
}

export default function TeamSection() {
  const allTrustees = [...trusteesRowOne, ...trusteesRowTwo];

  const trusteesIsOdd = allTrustees.length % 2 === 1;

  return (
    <section className="bg-[#FFF6D8] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-10 xl:py-20 lg:px-6 xl:px-6">
      {/* HEADER */}
      <div className="mx-auto mb-12 flex flex-col gap-5 lg:mb-16 lg:flex-row lg:items-start lg:justify-between lg:gap-[60px] 2xl:px-40">
        <div className="flex items-stretch gap-5">
          <span className="w-[3px] flex-none rounded-full bg-[#FCCC2D]" />

          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline text-[#382E07]"
          >
            Meet the People <br className="hidden lg:block" />
            Behind the Mission
          </Typography>
        </div>

        <Typography
          variant="body-3"
          as="p"
          className="w-full font-argestadisplay text-[#596D79] lg:max-w-md"
        >
          A dedicated team working together to advance cancer awareness,
          support patients, and build healthier communities through
          compassion, collaboration, and meaningful impact.
        </Typography>
      </div>

      {/* TRUSTEES DIVIDER */}
      <div className="mx-auto mb-24 flex max-w-[1260px] items-center justify-center gap-4 md:gap-[22px]">
        <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-l from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />

        <Typography
          variant="heading-6"
          as="span"
          className="whitespace-nowrap font-tiempos-headline text-[#382E07]"
        >
          Trustees
        </Typography>

        <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-r from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
      </div>

      {/* TRUSTEES — BELOW LG */}
      <div className="mx-auto mb-8 grid max-w-[1260px] grid-cols-1 justify-items-center gap-x-4 gap-y-16 sm:grid-cols-2 lg:hidden">
        {allTrustees.map((p, i) => {
          const isDanglingLast = trusteesIsOdd && i === allTrustees.length - 1;

          return (
            <div
              key={p.name}
              className={cx(
                XS_FIXED_CARD_WIDTH,
                "sm:w-full",
                isDanglingLast && "sm:col-span-2",
              )}
            >
              <PersonCard
                {...p}
                widthClass={
                  isDanglingLast
                    ? "w-full sm:mx-auto sm:w-[calc((100%-1rem)/2)]"
                    : "w-full"
                }
                fadeBottom
                wrapLabel
              />
            </div>
          );
        })}
      </div>

      {/* TRUSTEES — LG+ */}
      <div className="mx-auto mb-16 hidden max-w-[1260px] flex-wrap justify-center gap-[1.875rem] md:mb-20 lg:flex">
        {trusteesRowOne.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>

      <div className="mx-auto mb-16 hidden max-w-[1260px] flex-wrap justify-center gap-[1.875rem] md:mb-24 lg:flex">
        {trusteesRowTwo.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>

      {/* TEAM MEMBERS — BELOW LG */}
      <div className="lg:hidden">
        <ArrowScrollCarousel people={teamRow} />
      </div>

      {/* TEAM MEMBERS — LG & XL */}
      <div className="hidden lg:block 2xl:hidden">
        <TeamCarousel people={teamRow} />
      </div>

      {/* TEAM MEMBERS — 2XL+ */}
      <div className="hidden grid-cols-4 justify-items-center gap-30 px-20 2xl:grid 3xl:gap-20 3xl:px-50">
        {teamRow.map((p) => (
          <PersonCard key={p.name} {...p} />
        ))}
      </div>
    </section>
  );
}