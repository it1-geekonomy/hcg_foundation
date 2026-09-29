"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Typography from "@/lib/Typography";
import {
  ART_GALLERY_CARDS,
  FADE_GRADIENT,
} from "@/domains/ourprograms/Swasthigallery/constants/artgallery";
import GallerySection from "./gallerysection";

const LINE_STEP_MS = 120; // delay between consecutive lines
const DESC_DELAY_MS = 250; // body starts after the heading
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

const HEADING_WORDS = ["A", "Space", "Where", "Art", "Heals"];
const HEADING_BREAK_AFTER = 2; // the lg-only line break sits after "Where"

const PARAGRAPHS = [
  "Swasti Art Gallery, an initiative of the HCG Foundation, is a creative care unit with galleries at HCG's main hospital in Bangalore and other HCG facilities across India. Launched in 2007, Swasti promotes art and raises funds to support cancer patients.",
  "The gallery creates a positive environment for patients and families while hosting art shows, camps, workshops, and art therapy events with artists from across India and abroad.",
  "Swasti also provides a platform for artists and art lovers by showcasing quality artwork and promoting emerging and established talent.",
];

type Word = { w: string; group: number; last: boolean };

const PARA_WORDS: Word[] = PARAGRAPHS.flatMap((p, gi) => {
  const parts = p.split(" ");
  return parts.map((w, wi) => ({ w, group: gi, last: wi === parts.length - 1 }));
});

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

  // Text slide-in (always from the left)
  const headWrapRef = useRef<HTMLDivElement | null>(null);
  const bodyWrapRef = useRef<HTMLDivElement | null>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const paraRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [headLines, setHeadLines] = useState<number[]>([]);
  const [paraLines, setParaLines] = useState<number[]>([]);
  const [paraLineCount, setParaLineCount] = useState(1);

  // Group words into the visual lines they actually wrap into.
  useLayoutEffect(() => {
    const measure = () => {
      // heading
      let line = 0;
      let prevTop: number | null = null;
      const hl: number[] = [];
      HEADING_WORDS.forEach((_, i) => {
        const top = headRefs.current[i]?.offsetTop ?? 0;
        if (prevTop !== null && top > prevTop + 2) line += 1;
        prevTop = top;
        hl.push(line);
      });
      setHeadLines(hl);

      // paragraphs (a new paragraph always starts a new line)
      let pLine = -1;
      let prevGroup = -1;
      let pTop = -Infinity;
      const pl = PARA_WORDS.map((f, i) => {
        const top = paraRefs.current[i]?.offsetTop ?? 0;
        if (f.group !== prevGroup || top > pTop + 2) {
          pLine += 1;
          prevGroup = f.group;
          pTop = top;
        }
        return pLine;
      });
      setParaLines(pl);
      setParaLineCount(pLine + 1);
    };

    measure();
    const t = setTimeout(measure, 150); // late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Each block plays once, when it first scrolls into view.
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
    const c1 = watch(headWrapRef.current, setHeadVisible);
    const c2 = watch(bodyWrapRef.current, setBodyVisible);
    return () => {
      c1?.();
      c2?.();
    };
  }, []);

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

  // Direction comes from the wrapper's --slide-x CSS variable (always left).
  const slideStyle = (isVisible: boolean, delayMs: number): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate3d(0,0,0)" : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  });

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] pt-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40">
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-2 xl:gap-10 2xl:gap-20">
        {/* Left: heading, paragraphs, email */}
        <div className="min-w-0">
          <div ref={headWrapRef} className="overflow-x-clip [--slide-x:-80px]">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline text-[#382E07] font-normal"
            >
              {HEADING_WORDS.map((w, i) => (
                <Fragment key={i}>
                  <span
                    ref={(el) => {
                      headRefs.current[i] = el;
                    }}
                    className="inline-block motion-reduce:!transition-none"
                    style={slideStyle(headVisible, (headLines[i] ?? 0) * LINE_STEP_MS)}
                  >
                    {w}
                  </span>
                  {i === HEADING_BREAK_AFTER ? (
                    <>
                      {" "}
                      <br className="hidden lg:block" />
                    </>
                  ) : i < HEADING_WORDS.length - 1 ? (
                    " "
                  ) : (
                    ""
                  )}
                </Fragment>
              ))}
            </Typography>
          </div>

          <div ref={bodyWrapRef} className="overflow-x-clip [--slide-x:-80px]">
            <div className="mt-6 space-y-5">
              {PARAGRAPHS.map((paragraph, gi) => (
                <Typography
                  key={gi}
                  variant="body-2"
                  as="p"
                  className="font-normal font-argestadisplay text-[#293239]"
                >
                  {PARA_WORDS.map((f, i) =>
                    f.group !== gi ? null : (
                      <Fragment key={i}>
                        <span
                          ref={(el) => {
                            paraRefs.current[i] = el;
                          }}
                          className="inline-block motion-reduce:!transition-none"
                          style={slideStyle(
                            bodyVisible,
                            DESC_DELAY_MS + (paraLines[i] ?? 0) * LINE_STEP_MS,
                          )}
                        >
                          {f.w}
                        </span>
                        {f.last ? "" : " "}
                      </Fragment>
                    ),
                  )}
                </Typography>
              ))}
            </div>

            <Typography
              variant="body-2"
              as="p"
              className="mt-6 font-normal font-argestadisplay text-[#293239]"
            >
              <span
                className="inline-block motion-reduce:!transition-none"
                style={slideStyle(
                  bodyVisible,
                  DESC_DELAY_MS + paraLineCount * LINE_STEP_MS,
                )}
              >
                Email:{" "}
                <Link href="mailto:swasthigallery@gmail.com">
                  swasthigallery@gmail.com
                </Link>
              </span>
            </Typography>
          </div>
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