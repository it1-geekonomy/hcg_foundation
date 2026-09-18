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
  SM_FLUID_CARD_WIDTH,
  type Person,
} from "@/domains/about/constants/teams";

const BACK_PANEL_GLASS_BG =
  "bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)] backdrop-blur-lg";

const OPEN_DURATION_MS = 600;
const CLOSE_DURATION_MS = 500;
const CROSSFADE_DURATION_MS = OPEN_DURATION_MS;
const DEFAULT_CARD_WIDTH_CLASS = "w-[clamp(17.5rem,20vw,21.25rem)]"; // 280px – 340px
const DEFAULT_CARD_TOP_OFFSET_CLASS =
  "-top-[clamp(1.875rem,6vw,3.75rem)]"; // 30px – 60px
const CARD_IMAGE_BOTTOM_INSET_CLASS = "bottom-[1.875rem]"; // 30px

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useSyncedLabelHeight(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState<number | null>(null);

  const measure = useCallback(() => {
    const heights = refs.current.map((el) => el?.offsetHeight ?? 0);
    const max = heights.length ? Math.max(...heights) : 0;
    setHeight(max || null);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, count]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    refs.current[i] = el;
  };

  return { setRef, height };
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

/** Same style as CMS / site error banners — used when photo is missing or fails. */
function ImageUnavailableNotice() {
  return (
    <div className="flex size-full items-center justify-center bg-[#FFF8F0] p-4">
      <Typography
        variant="caption-1"
        as="p"
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-red-700"
      >
        Image not available
      </Typography>
    </div>
  );
}

export function PersonCard({
  name,
  role,
  img,
  widthClass,
  fadeBottom = false,
  wrapLabel = false,
  dropShadow = true,
  topOffsetClass,
  description = [],
  labelRef,
  labelHeight,
  style,
}: Person & {
  widthClass?: string;
  fadeBottom?: boolean;
  wrapLabel?: boolean;
  dropShadow?: boolean;
  topOffsetClass?: string;
  labelRef?: (el: HTMLDivElement | null) => void;
  labelHeight?: number | null;
  style?: CSSProperties;
}) {
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
      style={style}
      className={cx(
        "relative aspect-[320/380] flex-none",
        widthClass ?? DEFAULT_CARD_WIDTH_CLASS,
      )}
    >
      {/* FRONT */}
      <div className={cx("absolute inset-0 rounded-md", flipped && "pointer-events-none")}>
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
              className="font-semibold font-manrope text-white"
            >
              {name}
            </Typography>

            {role ? (
              <Typography
                variant="body-7"
                as="p"
                className="font-normal font-manrope text-white/85"
              >
                {role}
              </Typography>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={`Show details for ${name}`}
            onPointerDown={(e) => {
              // Prevent the carousel track's drag/pointer-capture logic
              // from swallowing this interaction before it becomes a click.
              e.stopPropagation();
            }}
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
              {description.length > 0 ? (
                description.map((paragraph, i) => (
                  <Typography
                    key={i}
                    variant="body-7"
                    as="p"
                    className="font-normal font-manrope leading-relaxed text-white/90"
                  >
                    {paragraph}
                  </Typography>
                ))
              ) : null}
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

const CAROUSEL_GAP_PX = 24;
// Static, literal class (no interpolation) so Tailwind always generates it —
// the actual pixel value is supplied at runtime via the --card-w CSS
// variable, set through the `style` prop on each PersonCard.
const CAROUSEL_CARD_WIDTH_CLASS = "w-[var(--card-w)]";

// How long the index-change slide transition takes. Wheel input is locked
// out for this long after a shift so one scroll gesture = one card, not a
// cascade of shifts while momentum/trackpad scrolling is still emitting
// wheel events.
const WHEEL_STEP_LOCK_MS = 550;
// Minimum accumulated wheel delta (px) before we treat it as an intentional
// horizontal scroll rather than noise from a vertical scroll gesture.
const WHEEL_DELTA_THRESHOLD = 10;

/**
 * NOTE: visibleCount / cardWidthPx are now configurable (defaulting to the
 * original lg/xl values: 3 visible cards at CARD_W) so the exact same
 * carousel — same arrows, same drag/scroll behavior, same gap — can be
 * reused for the 2xl grid when it has more than 4 people, without touching
 * anything about how it already behaves on lg/xl.
 */
function TeamCarousel({
  people,
  visibleCount = 3,
  cardWidthPx = CARD_W,
}: {
  people: Person[];
  visibleCount?: number;
  cardWidthPx?: number;
}) {
  const trackWidth = visibleCount * cardWidthPx + (visibleCount - 1) * CAROUSEL_GAP_PX;
  const step = cardWidthPx + CAROUSEL_GAP_PX;
  const maxIndex = Math.max(0, people.length - visibleCount);
  const [index, setIndex] = useState(0);
  const needsCarousel = people.length > visibleCount;
  const [dragging, setDragging] = useState(false);
  const [dragDeltaPx, setDragDeltaPx] = useState(0);
  const dragStartXRef = useRef(0);
  const trackViewportRef = useRef<HTMLDivElement>(null);
  const wheelLockedRef = useRef(false);

  const clampIndex = useCallback(
    (i: number) => Math.min(maxIndex, Math.max(0, i)),
    [maxIndex],
  );

  // Keep the current index in range if the visible count / people length
  // changes (e.g. responsive breakpoint swap) so we never end up pointing
  // past the last valid page.
  useEffect(() => {
    setIndex((i) => clampIndex(i));
  }, [clampIndex]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!needsCarousel) return;

    // Don't hijack pointer capture when the gesture starts on an
    // interactive control (e.g. the card's flip button) — otherwise the
    // resulting click never reaches the button because the track has
    // already captured the pointer.
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    setDragging(true);
    dragStartXRef.current = e.clientX;
    setDragDeltaPx(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragDeltaPx(e.clientX - dragStartXRef.current);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = step / 4;
    if (dragDeltaPx <= -threshold) {
      setIndex((i) => clampIndex(i + 1));
    } else if (dragDeltaPx >= threshold) {
      setIndex((i) => clampIndex(i - 1));
    }
    setDragDeltaPx(0);
  };

  // Smooth, one-shift-per-gesture horizontal wheel/trackpad scrolling.
  // Attached via a native, non-passive listener (React's onWheel is passive
  // by default, which would block preventDefault) so we can stop the page
  // from also scrolling vertically while the user is swiping the carousel.
  useEffect(() => {
    const el = trackViewportRef.current;
    if (!el || !needsCarousel) return;

    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < WHEEL_DELTA_THRESHOLD) return;

      e.preventDefault();

      if (wheelLockedRef.current) return;
      wheelLockedRef.current = true;

      setIndex((i) => clampIndex(i + (delta > 0 ? 1 : -1)));

      window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, WHEEL_STEP_LOCK_MS);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [needsCarousel, clampIndex]);

  const { setRef: setLabelRef, height: labelHeight } = useSyncedLabelHeight(people.length);

  const atStart = index === 0;
  const atEnd = index >= maxIndex;

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    setIndex((i) => Math.min(maxIndex, i + 1));
  };

  // Clamp the *visual* translate so the track can never be dragged past the
  // first or last card — no rubber-banding into empty space beyond the
  // carousel's actual bounds.
  const minTranslateX = -(maxIndex * step);
  const maxTranslateX = 0;
  const baseTranslateX = -(index * step);
  const trackTranslateX = dragging
    ? Math.min(maxTranslateX, Math.max(minTranslateX, baseTranslateX + dragDeltaPx))
    : baseTranslateX;

  return (
    <div className="mx-auto flex w-fit max-w-full items-center gap-2">
      {needsCarousel && (
        <ArrowButton direction="left" disabled={atStart} onClick={goPrev} />
      )}

      <div
        ref={trackViewportRef}
        className={cx(
          "-mt-20 w-[var(--track-w)] max-w-full overflow-hidden pt-20",
          needsCarousel && "touch-pan-y select-none",
          dragging ? "cursor-grabbing" : needsCarousel && "cursor-grab",
        )}
        style={{ "--track-w": `${trackWidth}px` } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className={cx(
            "flex translate-x-[var(--track-x)] gap-6 ease-out",
            dragging ? "duration-0" : "transition-transform duration-500",
          )}
          style={{ "--track-x": `${trackTranslateX}px` } as CSSProperties}
        >
          {people.map((p, i) => (
            <PersonCard
              key={p.id ?? p.name}
              {...p}
              widthClass={CAROUSEL_CARD_WIDTH_CLASS}
              style={{ "--card-w": `${cardWidthPx}px` } as CSSProperties}
              labelRef={setLabelRef(i)}
              labelHeight={labelHeight}
            />
          ))}
        </div>
      </div>

      {needsCarousel && (
        <ArrowButton direction="right" disabled={atEnd} onClick={goNext} />
      )}
    </div>
  );
}
const MOBILE_CARD_GAP_PX = 16;

function ArrowScrollCarousel({ people }: { people: Person[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(people.length <= 1);

  const { setRef: setLabelRef, height: labelHeight } = useSyncedLabelHeight(people.length);

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
          {people.map((p, i) => (
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
                labelRef={setLabelRef(i)}
                labelHeight={labelHeight}
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

export type TeamSectionProps = {
  trustees?: Person[];
  teamMembers?: Person[];
};

function chunkPeople(people: Person[], size: number): Person[][] {
  if (people.length === 0) return [];
  const rows: Person[][] = [];
  for (let i = 0; i < people.length; i += size) {
    rows.push(people.slice(i, i + size));
  }
  return rows;
}

export default function TeamSection({
  trustees,
  teamMembers,
}: TeamSectionProps) {
  const allTrustees = trustees ?? [];
  const teamPeople = teamMembers ?? [];
  const trusteeRowsLg = chunkPeople(allTrustees, 3);
  // Only the 2xl grid layout needs to become a carousel — this is the only
  // thing that changes based on count. Everything else is untouched.
  const teamNeeds2xlCarousel = teamPeople.length > 4;

  const { setRef: setTrusteeLabelRef, height: trusteeLabelHeight } =
    useSyncedLabelHeight(allTrustees.length);
  const { setRef: setTeamGridLabelRef, height: teamGridLabelHeight } =
    useSyncedLabelHeight(teamPeople.length);

  return (
    <section className="bg-[#FFF6D8] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:px-6 lg:py-10 xl:px-6 xl:py-20">
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

      {allTrustees.length > 0 ? (
        <>
          <div className="mx-auto mb-4 flex max-w-[1260px] items-center justify-center gap-4 md:gap-[22px] lg:mb-24">
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

          <div className="mb-4 lg:hidden">
            <ArrowScrollCarousel people={allTrustees} />
          </div>

          <div className="mx-auto mb-16 hidden max-w-[1260px] flex-col gap-16 md:mb-24 lg:flex">
            {trusteeRowsLg.map((row, rowIndex) => {
              const offset = rowIndex * 3;
              return (
                <div
                  key={`trustee-row-${rowIndex}`}
                  className="flex flex-wrap justify-center gap-[1.875rem]"
                >
                  {row.map((p, i) => (
                    <PersonCard
                      key={p.id ?? p.name}
                      {...p}
                      labelRef={setTrusteeLabelRef(offset + i)}
                      labelHeight={trusteeLabelHeight}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {teamPeople.length > 0 ? (
        <>
          <div className="mx-auto mb-4 flex max-w-[1260px] items-center justify-center gap-4 md:gap-[22px] lg:mb-24">
            <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-l from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
            <Typography
              variant="heading-6"
              as="span"
              className="whitespace-nowrap font-tiempos-headline text-[#382E07]"
            >
              Teams
            </Typography>
            <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-r from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
          </div>

          <div className="lg:hidden">
            <ArrowScrollCarousel people={teamPeople} />
          </div>

          <div className="hidden lg:block 2xl:hidden">
            <TeamCarousel people={teamPeople} />
          </div>

          {teamNeeds2xlCarousel ? (
            // More than 4 team members: reuse the exact same carousel
            // (arrows + drag/scroll) used on lg/xl, just sized for 4
            // visible cards at the 2xl card width.
            <div className="hidden 2xl:block">
              <TeamCarousel
                people={teamPeople}
                visibleCount={4}
                cardWidthPx={CARD_W_2XL}
              />
            </div>
          ) : (
            <div className="hidden grid-cols-4 justify-items-center gap-30 px-20 2xl:grid 3xl:gap-20 3xl:px-50">
              {teamPeople.map((p, i) => (
                <PersonCard
                  key={p.id ?? p.name}
                  {...p}
                  labelRef={setTeamGridLabelRef(i)}
                  labelHeight={teamGridLabelHeight}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}