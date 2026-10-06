"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  AUTO_SCROLL_SPEED,
  DRAG_THRESHOLD,
  RESUME_DELAY,
  SAVE_INTERVAL,
  STORAGE_KEY,
  wrap,
  stories as fallbackStories,
} from "@/domains/home/constants/smile";
import { motion } from "framer-motion";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

/** Items requested per API call. The loop below keeps fetching pages until none are left. */
const PAGE_SIZE = 50;
/** Safety net so a misbehaving API can never cause an endless request loop. */
const MAX_PAGES = 1000;
/**
 * The track renders: [CLONES tail cards | every story | CLONES head cards].
 * The clones on each side are what you see when the loop restarts or when you
 * drag past either end, so they must cover at least one screen width. The
 * number is re-measured at runtime and only ever grows (up to MAX_CLONES).
 * Lists shorter than the clone count are repeated to fill it.
 */
const MIN_CLONES = 16;
const MAX_CLONES = 80;

/** Pasted CMS HTML carries its own colours/backgrounds; keep it on-brand and compact. */
const STORY_HTML_CLASS = [
  // Left-aligned with balanced wrapping: justify opens wide word gaps in a column this narrow.
  "font-manrope text-left [&_*]:!text-left [text-wrap:pretty] [overflow-wrap:break-word]",
  "[&_*]:!bg-transparent [&_*]:!text-[#0D2838]",
  "[&_p_*]:![font-size:inherit] [&_li_*]:![font-size:inherit]",
  "[&_p]:!m-0 [&_p+p]:!mt-3.5 [&_p]:[font-size:0.9375rem] [&_p]:leading-[1.7] sm:[&_p]:[font-size:1rem] xl:[&_p]:[font-size:1.0625rem]",
  "[&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_h1]:[font-size:1.125rem] [&_h2]:[font-size:1.125rem] [&_h3]:[font-size:1.0625rem] [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:mb-1.5 [&_li]:[font-size:0.9375rem] [&_li]:leading-[1.7] sm:[&_li]:[font-size:1rem] xl:[&_li]:[font-size:1.0625rem]",
  "[&_a]:!text-[#9A7B00] [&_a]:underline-offset-2 hover:[&_a]:underline",
].join(" ");

/** Rich-text editors leave trailing <br>s and empty paragraphs that show up as uneven gaps. */
function tidyStoryHtml(html: string): string {
  return html
    .replace(/(?:\s*<br\s*\/?>)+\s*(<\/p>)/gi, "$1")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
    .replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .trim();
}

function formatStoryDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Invisible copy of the card's front layout. It sits in normal flow, so the
 * card's height comes from its content: when a name wraps to 2 lines the
 * footer (and therefore the whole card) gets taller. Because the carousel
 * track is a flex row, every card is then stretched to the tallest one.
 *
 * NOTE: the footer classes here MUST match the footer in StoryCard's front.
 */
function StoryCardSizer({ name, date }: { name: string; date: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none invisible flex select-none flex-col justify-between overflow-hidden rounded-[1.2643rem] border-[0.0527rem] border-transparent pt-[1.4223rem] pl-[1.475rem] pr-[1.4223rem] pb-0"
    >
      <div className="aspect-[21.177/23.021] w-full shrink-0" />
      <div className="flex flex-col justify-between pt-[1.4rem] pb-4">
        <Typography
          variant="heading-8"
          as="p"
          className="text-left font-semibold font-manrope"
        >
          {name}
        </Typography>
        {date && date.trim() ? (
          <Typography
            variant="text-2"
            as="p"
            className="mt-1 flex items-center gap-2 text-nowrap font-normal font-manrope"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
            {date}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}

/**
 * memo(): with hundreds of cards, a single hover-flip used to re-render every
 * card (the flipped index lives in the parent). All props below are primitives
 * or stable references, so only the card that really changed re-renders.
 */
const StoryCard = memo(function StoryCard({
  name,
  date,
  image,
  objectPosition,
  excerpt,
  storyHtml,
  link,
  index,
  isFlipped,
  onFlip,
  onOpen,
}: {
  name: string;
  date: string;
  image: string;
  objectPosition?: string;
  excerpt?: string;
  /** Full story (CMS rich text). When set, the back shows it instead of the excerpt. */
  storyHtml?: string;
  link: string;
  index: number;
  isFlipped?: boolean;
  onFlip?: (index: number, flipped: boolean) => void;
  /** Omit to make the card non-navigating (no Read More, no click-through). */
  onOpen?: (link: string) => void;
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const currentFlipped = isFlipped !== undefined ? isFlipped : internalFlipped;
  const onFlipChange = (f: boolean) => onFlip?.(index, f);
  const onCardClick = (_e?: React.MouseEvent) => onOpen?.(link);

  const handleFlipChange = (f: boolean) => {
    if (isFlipped === undefined) setInternalFlipped(f);
    onFlipChange?.(f);
  };

  const frontContent = (
    <div className="group flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.2643rem] border-[0.0527rem] border-[rgba(255,255,255,0.55)] bg-[rgba(0,0,0,0.23)] backdrop-blur-[1.30625rem] pt-[1.4223rem] pl-[1.475rem] pr-[1.4223rem] pb-0">
      {/* photo: aspect 21.177rem / 23.021rem and 1.2643rem radius from Figma */}
      <div className="relative w-full aspect-[21.177/23.021] shrink-0 overflow-hidden rounded-[1.2643rem] bg-[#00000014]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 639px) clamp(240px, 65vw, 320px), (max-width: 767px) clamp(280px, 52vw - 34px, 360px), (max-width: 1023px) clamp(320px, 52vw - 42px, 400px), (max-width: 1279px) clamp(320px, 30vw - 20px, 400px), clamp(280px, 22vw - 6px, 410px)"
            style={{ objectPosition: objectPosition ?? "center" }}
            className="rounded-[1.2643rem] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : null}
      </div>

      {/* name pinned to the top of the footer, date pinned to the bottom.
          Every card in the row is the same height (the tallest one), so names
          all start on the same line and dates all sit on the same line.
          When no name wraps, the footer is only as tall as its content, so the
          name and date stay close together. */}
      <div className="flex flex-1 flex-col justify-between pt-[1.4rem] pb-4">
        <Typography
          variant="heading-8"
          as="p"
          className="text-left text-white font-semibold font-manrope"
        >
          {name}
        </Typography>
        {date && date.trim() ? (
          <Typography
            variant="text-2"
            as="p"
            className="mt-1 flex items-center gap-2 text-white text-nowrap font-normal font-manrope"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
            {date}
          </Typography>
        ) : null}
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div
        className={`relative h-full w-full flex flex-col justify-between items-center rounded-[1.2643rem] border-[0.0527rem] border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2] ${
          storyHtml ? "p-4 sm:p-[1.425rem]" : "p-[1.425rem]"
        }`}
      >
        {/* Scrollable Story Description matching Team & Trustees pattern */}
        <div
          className={`min-h-0 w-full flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            storyHtml
              ? // Bottom fade hints that the story scrolls; the matching bottom padding
                // lets the last line scroll clear of the fade.
                "pb-8 [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]"
              : "pr-1.5 space-y-2.5"
          }`}
        >
          {storyHtml ? (
            <div
              className={STORY_HTML_CLASS}
              dangerouslySetInnerHTML={{ __html: storyHtml }}
            />
          ) : excerpt ? (
            excerpt
              .split("\n\n")
              .map((paragraph, idx) => (
                <Typography
                  key={idx}
                  variant="body-9"
                  as="p"
                  className="font-manrope leading-relaxed font-normal !text-[#0D2838] text-left"
                >
                  {paragraph}
                </Typography>
              ))
          ) : null}
        </div>

        {onOpen ? (
          <div className="relative z-10 w-full flex justify-center shrink-0 pt-3 border-t border-[#E0D4AE]/50 mt-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCardClick?.(e);
              }}
              className="inline-flex items-center justify-center whitespace-nowrap h-[2rem] lg:h-[2.35rem] w-auto px-4 lg:px-5 gap-[0.45rem] rounded-[0.375rem] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
            >
              <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
                Read More
              </Typography>
              <DiagonalArrowIcon className="w-[0.95rem] h-[0.8rem] lg:w-[1.05rem] lg:h-[0.88rem] text-[#2D2D2D] shrink-0" />
            </div>
          </div>
        ) : null}
      </div>
    </MirrorReveal>
  );

  return (
    // flex-1 = fill the (stretched) carousel item; the sizer gives the minimum height
    <div className="relative w-full flex-1">
      <StoryCardSizer name={name} date={date} />

      {/* the real flip card fills whatever height the row ends up with */}
      <div className="absolute inset-0">
        <FlipCard
          className="h-full w-full rounded-[1.2643rem]"
          roundedClassName="rounded-[1.2643rem]"
          isFlipped={currentFlipped}
          onFlipChange={handleFlipChange}
          onClick={(e) => {
            // On desktop mouse, clicking the card navigates.
            // On mobile touch, clicking the card flips or taps Read More.
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(hover: hover)").matches
            ) {
              onCardClick?.(e);
            }
          }}
          flipOnHover={true}
          duration={0.42}
          front={frontContent}
          back={renderBackContent}
        />
      </div>
    </div>
  );
});

/**
 * Data source switch.
 *  true  -> load EVERY published story from the CMS (all pages, no cap).
 *           The constants are only used as a fallback if the CMS request
 *           fails or returns nothing.
 *  false -> use only the static stories from
 *           "@/domains/home/constants/smile" (no network calls).
 */
const USE_CMS = true;

const staticStories = fallbackStories.map((s) => ({ ...s, excerpt: "" }));

/**
 * home      -> back shows the short description + Read More; card opens the story page.
 * fullStory -> back shows the full story (scrollable); no Read More, no navigation,
 *              and no static fallback — the section hides when the CMS has nothing.
 */
export type SmileStoriesVariant = "home" | "fullStory";

export default function SmileStories({
  variant = "home",
}: {
  variant?: SmileStoriesVariant;
}) {
  const fullStory = variant === "fullStory";
  const fallback = fullStory ? [] : staticStories;
  const [apiStories, setApiStories] = useState<any[] | null>(
    USE_CMS ? null : fallback,
  );

  useEffect(() => {
    if (!USE_CMS) return;
    let cancelled = false;
    (async () => {
      try {
        // Fetch EVERY published story: keep requesting pages until the API
        // has nothing more to give.
        const all: any[] = [];
        const seen = new Set<string | number>();
        let page = 1;
        let totalPages: number | null = null;

        while (page <= MAX_PAGES) {
          const res: any = await publicPatientStoriesApi.listPublished({
            page,
            limit: PAGE_SIZE,
          });
          if (cancelled) return;

          const batch: any[] = res?.data ?? [];
          if (batch.length === 0) break;

          // Dedupe: if the API ignores `page` and returns the same items,
          // stop instead of looping forever.
          let added = 0;
          for (const item of batch) {
            const key = item.id ?? item.slug ?? item.title;
            if (seen.has(key)) continue;
            seen.add(key);
            all.push(item);
            added += 1;
          }
          if (added === 0) break;

          // Use the API's page info when it provides it (field names may differ).
          const metaTotal =
            res?.meta?.totalPages ??
            res?.pagination?.totalPages ??
            res?.totalPages ??
            null;
          if (typeof metaTotal === "number") totalPages = metaTotal;
          if (totalPages !== null && page >= totalPages) break;

          page += 1;
        }

        if (cancelled) return;

        if (all.length > 0) {
          const mapped = all.map((item) => ({
            name: item.title,
            date: formatStoryDate(item.storyDate),
            image: item.patientImage || "",
            link: `/patient-stories/${item.slug || item.id}`,
            excerpt: fullStory ? "" : item.shortDescription || "",
            storyHtml: fullStory ? tidyStoryHtml(item.content || "") : "",
          }));
          setApiStories(mapped);
        } else {
          setApiStories(fullStory ? [] : staticStories);
        }
      } catch {
        if (!cancelled) {
          setApiStories(fullStory ? [] : staticStories);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fullStory]);

  if (apiStories === null) {
    return <div className="min-h-[400px]"></div>;
  }

  if (apiStories.length === 0) {
    return null;
  }

  return <SmileStoriesCarousel apiStories={apiStories} variant={variant} />;
}

function SmileStoriesCarousel({
  apiStories,
  variant,
}: {
  apiStories: any[];
  variant: SmileStoriesVariant;
}) {
  const router = useRouter();
  const navigable = variant === "home";
  // Each page keeps its own remembered carousel position.
  const storageKey = navigable ? STORAGE_KEY : `${STORAGE_KEY}:${variant}`;

  // Track layout:  [ tail clones | ALL stories | head clones ]
  //                  prefix        one loop        suffix
  // The visible window is always inside the middle part plus a little of the
  // clones, so the jump back by exactly one loop length at the end is
  // invisible - while dragging in either direction as well as when auto
  // scrolling. Only N + 2*clones cards are in the DOM (not 3*N).
  const [cloneCount, setCloneCount] = useState(MIN_CLONES);
  const reps = Math.max(1, Math.ceil(cloneCount / Math.max(1, apiStories.length)));
  const baseStories = useMemo(
    () => Array.from({ length: reps }, () => apiStories).flat(),
    [apiStories, reps],
  );
  const baseCount = baseStories.length; // always >= cloneCount
  const isInfinite = baseCount > 0;
  const displayStories = useMemo(
    () => [
      ...baseStories.slice(baseCount - cloneCount),
      ...baseStories,
      ...baseStories.slice(0, cloneCount),
    ],
    [baseStories, baseCount, cloneCount],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  // Heading blur reveal — plays once, the first time it scrolls into view.
  const headingRef = useRef<HTMLDivElement | null>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  const offsetRef = useRef(0); // kept wrapped inside [0, oneSetWidth)
  const oneSetWidthRef = useRef(0); // length of one full loop (all stories)
  const prefixWidthRef = useRef(0); // width of the tail clones before the first story

  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false); // true if the current pointer gesture moved past the threshold
  const isPausedRef = useRef(false); // paused by drag/click/wheel interaction
  const isHoverPausedRef = useRef(false); // paused by hovering a card
  const isFlippedRef = useRef(false); // paused when a card is flipped
  const [activeFlippedIndex, setActiveFlippedIndex] = useState<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const lastSaveTsRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const measureRafRef = useRef<number | null>(null);

  const applyTransform = () => {
    if (!trackRef.current) return;
    const shift = offsetRef.current + prefixWidthRef.current;
    trackRef.current.style.transform = `translate3d(-${shift}px, 0, 0)`;
  };

  const saveOffset = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(storageKey, String(offsetRef.current));
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) - ignore
    }
  }, [storageKey]);

  const measure = () => {
    const track = trackRef.current;
    if (!track || !isInfinite) return;
    const kids = track.children;
    const firstClone = kids[0] as HTMLElement | undefined;
    const firstStory = kids[cloneCount] as HTMLElement | undefined;
    const firstHead = kids[cloneCount + baseCount] as HTMLElement | undefined;
    if (!firstClone || !firstStory || !firstHead) return;

    const left = (el: HTMLElement) => el.getBoundingClientRect().left;
    // Exact distances taken from real card positions (include every gap).
    // scrollWidth / 3 is slightly short (last card has no trailing gap) and
    // made the wrap jump by a few pixels.
    const prefix = left(firstStory) - left(firstClone);
    const loop = left(firstHead) - left(firstStory);
    if (loop <= 0) return;

    // Clones must cover a whole screen on each side - grow if not.
    const step = (kids[1] as HTMLElement | undefined)
      ? left(kids[1] as HTMLElement) - left(firstClone)
      : 0;
    const viewportW = viewportRef.current?.clientWidth ?? 0;
    if (step > 0 && viewportW > 0) {
      const needed = Math.min(MAX_CLONES, Math.ceil(viewportW / step) + 2);
      if (needed > cloneCount) setCloneCount(needed);
    }

    prefixWidthRef.current = prefix;
    oneSetWidthRef.current = loop;
    offsetRef.current = wrap(offsetRef.current, loop);
    applyTransform();
  };

  // Debounced measure: avoids layout thrash / jumpy transforms when the
  // ResizeObserver fires multiple times in a row (e.g. during a viewport
  // resize or an orientation change), which is what caused the visible
  // stutter on some screens.
  const scheduleMeasure = () => {
    if (measureRafRef.current) cancelAnimationFrame(measureRafRef.current);
    measureRafRef.current = requestAnimationFrame(() => {
      measureRafRef.current = null;
      measure();
    });
  };

  // Restore last scroll position (e.g. user clicked a card, then hit back)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed)) {
          offsetRef.current = parsed;
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persist offset when the user navigates away or closes the tab
  useEffect(() => {
    const handleSave = () => saveOffset();
    window.addEventListener("pagehide", handleSave);
    window.addEventListener("beforeunload", handleSave);
    return () => {
      window.removeEventListener("pagehide", handleSave);
      window.removeEventListener("beforeunload", handleSave);
      saveOffset(); // also save on unmount (e.g. SPA route change)
    };
  }, [saveOffset]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Heading blur reveal observer
  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => scheduleMeasure());
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      if (measureRafRef.current) cancelAnimationFrame(measureRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered]);

  // Cards were added/removed (clone count changed) -> re-measure.
  useEffect(() => {
    scheduleMeasure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCount, cloneCount]);

  useEffect(() => {
    if (!hasEntered || !isInfinite) return;

    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      // Clamp dt so a dropped/backgrounded frame (tab switch, slow device)
      // doesn't cause a big visible jump when the animation resumes - this
      // is what made the movement look "unsmooth" on some screens.
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      const shouldMove =
        !isDraggingRef.current &&
        !isPausedRef.current &&
        !isHoverPausedRef.current &&
        !isFlippedRef.current &&
        oneSetWidthRef.current > 0;

      if (shouldMove) {
        offsetRef.current = wrap(
          offsetRef.current + AUTO_SCROLL_SPEED * dt,
          oneSetWidthRef.current
        );
        applyTransform();

        // periodically persist so a hard refresh / crash doesn't lose position
        if (ts - lastSaveTsRef.current > SAVE_INTERVAL) {
          lastSaveTsRef.current = ts;
          saveOffset();
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [hasEntered]);

  const clearResumeTimer = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const scheduleResume = () => {
    clearResumeTimer();
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, RESUME_DELAY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInfinite) return;
    isPausedRef.current = true;
    didDragRef.current = false;
    clearResumeTimer();
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    pointerIdRef.current = e.pointerId;
    // Do not call setPointerCapture here; wait until drag threshold is exceeded
    // so child touch/click events (flip, read more) pass through on tap.
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInfinite || pointerIdRef.current === null || oneSetWidthRef.current === 0) return;
    const dx = dragStartXRef.current - e.clientX;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return; // ignore tiny jitters / clicks
      isDraggingRef.current = true;
      didDragRef.current = true;
      if (activeFlippedIndex !== null) {
        setActiveFlippedIndex(null);
        isFlippedRef.current = false;
      }
      try {
        e.currentTarget.setPointerCapture(pointerIdRef.current);
      } catch {
        // ignore
      }
    }

    offsetRef.current = wrap(dragStartOffsetRef.current + dx, oneSetWidthRef.current);
    applyTransform();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInfinite) return;
    if (pointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {
        // ignore if already released
      }
    }
    pointerIdRef.current = null;
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (wasDragging) {
      // real drag - give the user a moment before auto-scroll kicks back in
      scheduleResume();
    } else {
      // simple click/tap - unpause immediately
      clearResumeTimer();
      isPausedRef.current = false;
    }
  };

  const handleCardClick = useCallback(
    (link: string) => {
      if (didDragRef.current) return; // it was a drag, not a click - don't navigate
      saveOffset();
      router.push(link);
    },
    [router, saveOffset],
  );

  const handleFlip = useCallback(
    (index: number, flipped: boolean) => {
      setActiveFlippedIndex(flipped ? index : null);
      isFlippedRef.current = flipped;

      // Touch screens only: auto-scroll stops while a card is flipped, so a card
      // flipped at the edge would stay half off-screen. Glide it to the centre.
      // (Not on hover devices — moving the card under the cursor would unflip it.)
      if (
        !flipped ||
        navigable ||
        !window.matchMedia("(hover: none)").matches
      ) {
        return;
      }
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const item = track?.children[index] as HTMLElement | undefined;
      const loop = oneSetWidthRef.current;
      if (!track || !viewport || !item || loop === 0) return;

      const vr = viewport.getBoundingClientRect();
      const ir = item.getBoundingClientRect();
      const delta = ir.left + ir.width / 2 - (vr.left + vr.width / 2);
      if (Math.abs(delta) < 2) return;

      // Left unwrapped on purpose: wrapping here would centre a clone instead of
      // the flipped card. The clones on each side cover more than a screen, and
      // the next auto-scroll/drag step wraps the offset again.
      offsetRef.current += delta;
      track.style.transition = "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = `translate3d(-${offsetRef.current + prefixWidthRef.current}px, 0, 0)`;
      window.setTimeout(() => {
        track.style.transition = "";
      }, 470);
    },
    [navigable],
  );

  return (
    <section
      ref={sectionRef}
      className={`relative w-full ${navigable ? "lg:py-20" : "pb-10 lg:pb-16 xl:pb-20"}`}
    >
      {navigable ? (
        <div ref={headingRef} className="mb-14">
          <Typography
            id="smilestories"
            variant="heading-3"
            as="h2"
            className="mx-auto text-center px-4 text-neutral-800 font-medium font-manrope pt-6 scroll-mt-24 motion-reduce:!transition-none"
            style={{
              opacity: headingVisible ? 1 : 0,
              filter: headingVisible ? "blur(0px)" : "blur(14px)",
              transform: headingVisible
                ? "translate3d(0,0,0)"
                : "translate3d(0,32px,0)",
              transition:
                "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "opacity, filter, transform",
            }}
          >
            Behind Every <em className="text-neutral-900 font-tiempos-headline">Smile Is a Story</em>
          </Typography>
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className={`mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 ${isInfinite ? 'overflow-hidden' : 'overflow-x-auto snap-x no-scrollbar'}`}
      >
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={() => {
            if (!isInfinite) return;
            isPausedRef.current = true;
            scheduleResume();
          }}
          // flex row (default align-items: stretch) => every card is as tall as the tallest one
          className={`flex w-max flex-nowrap gap-3 sm:gap-5 lg:gap-8 ${isInfinite
              ? 'touch-pan-y cursor-grab select-none will-change-transform active:cursor-grabbing'
              : 'touch-pan-x snap-mandatory'
            }`}
        >
          {displayStories.map((story, i) => (
            <div
              key={`${story.name}-${i}`}
              className="flex flex-col shrink-0 basis-[clamp(240px,65vw,320px)] sm:basis-[clamp(280px,52vw-34px,360px)] md:basis-[clamp(320px,52vw-42px,400px)] lg:basis-[clamp(320px,30vw-20px,400px)] xl:basis-[clamp(280px,22vw-6px,410px)]"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") {
                  isHoverPausedRef.current = true;
                }
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") {
                  isHoverPausedRef.current = false;
                }
              }}
              onDragStart={(e) => e.preventDefault()}
            >
              <StoryCard
                {...story}
                index={i}
                isFlipped={activeFlippedIndex === i}
                onFlip={handleFlip}
                onOpen={navigable ? handleCardClick : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}