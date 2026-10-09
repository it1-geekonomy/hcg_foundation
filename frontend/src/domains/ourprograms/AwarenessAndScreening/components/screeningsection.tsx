"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import Typography from "@/lib/Typography";
import AnimatedImageTile, {
  RevealStyles,
  useInViewOnce,
  type TileAnimation,
} from "@/shared/components/Animatedimagetile";

import {
  SCREENING_IMAGES,
  STUDENT_IMAGES,
  PAGE_SIZE_MOBILE,
  PAGE_SIZE_DESKTOP,
  SM_BREAKPOINT,
} from "@/domains/ourprograms/AwarenessAndScreening/constants/screening";

/* ---------- slide-in text animation (inline, always from the left) ---------- */

const LINE_STEP_MS = 120; // delay between consecutive lines
const DESC_DELAY_MS = 250; // body starts after the heading
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

const MOBILE_HEADING = "Mobile Screening";
const MOBILE_PARA =
  "Bringing cancer screening closer to communities, HCG Foundation’s mobile screening initiative takes essential diagnostic services directly to underserved and remote areas. Equipped with healthcare professionals and screening facilities, the mobile unit supports early detection, raises cancer awareness, and helps people access timely screening closer to home.";

const STUDENT_HEADING = "Student Outreach";
const STUDENT_PARAS = [
  "Since 2018, HCG Foundation has conducted healthy habits campaigns for 4th, 5th, and 6th-grade students in government schools. The program includes interactive sessions on nutrition, yoga, art, HPV vaccination, and conversations with healthcare professionals, helping students understand healthy lifestyle choices, peer pressure, substance abuse, and the importance of maintaining a balanced diet.",
  "The initiative aims to build healthy habits and awareness from an early age, empowering children with practical knowledge that can support their physical, emotional, and overall well being.",
];

type Word = { w: string; group: number; last: boolean };

// Each text (heading or paragraph) is its own group, so it always starts a new line.
function toWords(texts: string[]): Word[] {
  return texts.flatMap((t, gi) => {
    const parts = t.split(" ");
    return parts.map((w, wi) => ({ w, group: gi, last: wi === parts.length - 1 }));
  });
}

const MOBILE_WORDS = toWords([MOBILE_HEADING, MOBILE_PARA]);
const STUDENT_WORDS = toWords([STUDENT_HEADING, ...STUDENT_PARAS]);

// Direction comes from the --slide-x CSS variable set on the section (always left).
function slideStyle(visible: boolean, delayMs: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  };
}

// Renders the words of one group (heading / paragraph) as animatable spans.
function renderWords(
  words: Word[],
  group: number,
  refs: MutableRefObject<(HTMLSpanElement | null)[]>,
  lines: number[],
  visible: boolean,
) {
  return words.map((f, i) =>
    f.group !== group ? null : (
      <Fragment key={i}>
        <span
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="inline-block motion-reduce:!transition-none"
          style={slideStyle(
            visible,
            (group > 0 ? DESC_DELAY_MS : 0) + (lines[i] ?? 0) * LINE_STEP_MS,
          )}
        >
          {f.w}
        </span>
        {f.last ? "" : " "}
      </Fragment>
    ),
  );
}

// Groups words into the visual lines they actually wrap into.
function computeLines(refs: (HTMLSpanElement | null)[], words: Word[]): number[] {
  let line = -1;
  let prevGroup = -1;
  let prevTop = -Infinity;
  return words.map((f, i) => {
    const top = refs[i]?.offsetTop ?? 0;
    if (f.group !== prevGroup || top > prevTop + 2) {
      line += 1;
      prevGroup = f.group;
      prevTop = top;
    }
    return line;
  });
}

/* ---------- gallery ---------- */

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
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 sm:h-7 sm:w-7"
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

function ScreeningGrid() {
  const isSmUp = useIsSmUp();
  const pageSize = isSmUp ? PAGE_SIZE_DESKTOP : 1;
  const maxStart = Math.max(0, SCREENING_IMAGES.length - pageSize);
  const [windowStart, setWindowStart] = useState(0);
  const [slideDir, setSlideDir] = useState<TileAnimation>("up");
  const [wrapperRef, inView] = useInViewOnce<HTMLDivElement>();

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

  const goPrev = () => {
    setSlideDir("prev");
    setWindowStart((s) => Math.max(0, s - pageSize));
  };
  const goNext = () => {
    setSlideDir("next");
    setWindowStart((s) => Math.min(maxStart, s + pageSize));
  };

  // Swipe / drag support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (deltaX > SWIPE_THRESHOLD && canGoPrev) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD && canGoNext) goNext();
  };

  const isMobileSingle = !isSmUp && pageSize === 1;

  const tileClass = `aspect-[4/3] shrink-0 ${
    isMobileSingle ? "w-full" : "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)]"
  }`;
  const tileSizes = isMobileSingle ? "100vw" : "(min-width: 640px) 33vw, 50vw";

  return (
    <div ref={wrapperRef} className="flex w-full items-center gap-1">
      {showArrows && <ArrowButton direction="left" onClick={goPrev} disabled={!canGoPrev} />}

      <div
        className="flex min-w-0 flex-1 flex-col gap-4 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Keys include windowStart so tiles remount and replay the slide animation on every page change */}
        <div className="flex flex-wrap justify-center gap-4">
          {row1.map((image, i) => (
            <AnimatedImageTile
              key={`${windowStart}-${image.id}`}
              image={image}
              index={i}
              animation={slideDir}
              play={inView}
              sizes={tileSizes}
              className={tileClass}
            />
          ))}
        </div>
        {row2.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {row2.map((image, i) => (
              <AnimatedImageTile
                key={`${windowStart}-${image.id}`}
                image={image}
                index={row1.length + i}
                animation={slideDir}
                play={inView}
                sizes={tileSizes}
                className={tileClass}
              />
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
  const [gridRef, inView] = useInViewOnce<HTMLDivElement>();

  return (
    <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <AnimatedImageTile
        image={first}
        index={0}
        play={inView}
        className="aspect-[4/3] w-full"
      />
      <AnimatedImageTile
        image={second}
        index={1}
        play={inView}
        className="aspect-[4/3] w-full"
      />
      <AnimatedImageTile
        image={third}
        index={2}
        play={inView}
        className="col-span-2 aspect-[4/3] w-1/2 justify-self-center sm:col-span-1 sm:w-full"
      />
    </div>
  );
}

export default function CancerScreeningSection() {
  const mobileWrapRef = useRef<HTMLDivElement | null>(null);
  const studentWrapRef = useRef<HTMLDivElement | null>(null);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [studentVisible, setStudentVisible] = useState(false);

  const mobileRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const studentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mobileLines, setMobileLines] = useState<number[]>([]);
  const [studentLines, setStudentLines] = useState<number[]>([]);

  // Re-measure the wrapped lines on mount and on resize (wrapping changes with width).
  useLayoutEffect(() => {
    const measure = () => {
      setMobileLines(computeLines(mobileRefs.current, MOBILE_WORDS));
      setStudentLines(computeLines(studentRefs.current, STUDENT_WORDS));
    };

    measure();
    const t = setTimeout(measure, 150); // late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Each block plays once, when its text first scrolls into view.
  useEffect(() => {
    const watch = (
      node: HTMLElement | null,
      set: (v: boolean) => void,
    ): (() => void) | undefined => {
      if (!node) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            set(true);
            obs.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      obs.observe(node);
      return () => obs.disconnect();
    };
    const c1 = watch(mobileWrapRef.current, setMobileVisible);
    const c2 = watch(studentWrapRef.current, setStudentVisible);
    return () => {
      c1?.();
      c2?.();
    };
  }, []);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFFCF1] px-8 pt-6 pb-6 [--slide-x:-80px] sm:px-12 md:px-16 lg:py-14 lg:px-6 xl:py-20 xl:px-6 2xl:px-40">
      <RevealStyles />

      {/* Mobile Screening */}
      <div className="w-full">
        <div ref={mobileWrapRef}>
          <Typography
            variant="heading-7"
            as="h3"
            className="font-tiempos-headline font-normal text-[#382E07]"
          >
            {renderWords(MOBILE_WORDS, 0, mobileRefs, mobileLines, mobileVisible)}
          </Typography>

          <Typography
            variant="body-2"
            as="p"
            className="mt-2 font-argestadisplay font-normal text-[#293239]"
          >
            {renderWords(MOBILE_WORDS, 1, mobileRefs, mobileLines, mobileVisible)}
          </Typography>
        </div>

        <div className="mt-6">
          <ScreeningGrid />
        </div>
      </div>

      {/* Student Outreach */}
      <div className="mt-12 w-full lg:mt-16">
        <div ref={studentWrapRef}>
          <Typography
            variant="heading-7"
            as="h3"
            className="font-tiempos-headline font-normal text-[#382E07]"
          >
            {renderWords(STUDENT_WORDS, 0, studentRefs, studentLines, studentVisible)}
          </Typography>

          <div className="mt-2 space-y-4">
            {STUDENT_PARAS.map((_, pi) => (
              <Typography
                key={pi}
                variant="body-2"
                as="p"
                className="font-argestadisplay font-normal text-[#293239]"
              >
                {renderWords(STUDENT_WORDS, pi + 1, studentRefs, studentLines, studentVisible)}
              </Typography>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <StudentOutreachGrid />
        </div>
      </div>
    </section>
  );
}