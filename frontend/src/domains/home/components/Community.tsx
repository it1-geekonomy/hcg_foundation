"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  communityContent,
  communityTagRows,
  communityTheme,
} from "@/domains/home/constants/community";

const LINE_STEP_MS = 120; // delay between consecutive text lines
const PILL_STEP_MS = 110; // delay between consecutive pills
const DESC_DELAY_MS = 250; // description starts after the heading
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

export default function CommunitySection() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const tagsWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const [tagsVisible, setTagsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  const headWords = communityContent.heading.split(" ");
  const descWords = communityContent.description.split(" ");
  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const descRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [headLines, setHeadLines] = useState<number[]>([]);
  const [descLines, setDescLines] = useState<number[]>([]);

  // Group words into the visual lines they actually wrap into.
  useLayoutEffect(() => {
    const compute = (refs: (HTMLSpanElement | null)[], count: number) => {
      let line = 0;
      let prevTop: number | null = null;
      const lines: number[] = [];
      for (let i = 0; i < count; i++) {
        const top = refs[i]?.offsetTop ?? 0;
        if (prevTop !== null && top > prevTop + 2) line += 1;
        prevTop = top;
        lines.push(line);
      }
      return lines;
    };

    const measure = () => {
      setHeadLines(compute(headRefs.current, headWords.length));
      setDescLines(compute(descRefs.current, descWords.length));
    };

    measure();
    const t = setTimeout(measure, 150); // late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Existing overlay-card observer (unchanged)
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pills + text each play once, when they first scroll into view.
  useEffect(() => {
    const watch = (node: HTMLElement | null, set: (v: boolean) => void) => {
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
    const c1 = watch(tagsWrapRef.current, setTagsVisible);
    const c2 = watch(textWrapRef.current, setTextVisible);
    return () => {
      c1?.();
      c2?.();
    };
  }, []);

  const scrollToDonateForm = () => {
    document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Direction comes from the wrapper's --slide-x CSS variable.
  const slideStyle = (visible: boolean, delayMs: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  });

  let pillIndex = 0;

  return (
    <section className="w-full px-6 pt-8 sm:px-10 md:px-14 lg:px-16 lg:py-16 xl:px-24 2xl:px-32">
      <div className="mx-auto max-w-[1400px]">
        {/* Tags left · heading + body right · vertically centered (Figma) */}
        <div className="mb-10 flex flex-col gap-8 overflow-x-clip md:mb-14 lg:mb-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-20">
          {/* Pills: always from the left, one after another.
              Below 640px the row wrappers use `contents`, so all pills
              flow as one naturally wrapping list. */}
          <div
            ref={tagsWrapRef}
            className="order-2 flex flex-col gap-2 [--slide-x:-80px] max-sm:flex-row max-sm:flex-wrap md:gap-5 lg:order-1 lg:max-w-[min(100%,32rem)] lg:shrink-0"
          >
            {communityTagRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-wrap gap-2 max-sm:contents md:gap-3"
              >
                {row.map((tag) => {
                  const delay = pillIndex * PILL_STEP_MS;
                  pillIndex += 1;
                  return (
                    <Typography
                      key={tag}
                      variant="label-2"
                      as="span"
                      className="rounded-xs px-3 py-1.5 text-center font-manrope font-normal whitespace-nowrap motion-reduce:!transition-none md:px-4 md:py-2"
                      style={{
                        backgroundColor: communityTheme.tagBg,
                        color: communityTheme.tagText,
                        ...slideStyle(tagsVisible, delay),
                      }}
                    >
                      {tag}
                    </Typography>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Text: from the left when stacked, from the right on lg, line by line */}
          <div
            ref={textWrapRef}
            className="order-1 max-w-4xl font-tiempos-text [--slide-x:-80px] lg:order-2 lg:text-left lg:[--slide-x:80px]"
          >
            <Typography variant="heading-2" as="h2" className="text-[#382E07] font-medium">
              {headWords.map((w, i) => (
                <span key={i}>
                  <span
                    ref={(el) => {
                      headRefs.current[i] = el;
                    }}
                    className="inline-block motion-reduce:!transition-none"
                    style={slideStyle(textVisible, (headLines[i] ?? 0) * LINE_STEP_MS)}
                  >
                    {w}
                  </span>
                  {i < headWords.length - 1 ? " " : ""}
                </span>
              ))}
            </Typography>
            <Typography
              variant="body-2"
              as="p"
              className="mt-3 font-light font-argestadisplay text-[#2D2300C2] md:mt-4"
            >
              {descWords.map((w, i) => (
                <span key={i}>
                  <span
                    ref={(el) => {
                      descRefs.current[i] = el;
                    }}
                    className="inline-block motion-reduce:!transition-none"
                    style={slideStyle(
                      textVisible,
                      DESC_DELAY_MS + (descLines[i] ?? 0) * LINE_STEP_MS,
                    )}
                  >
                    {w}
                  </span>
                  {i < descWords.length - 1 ? " " : ""}
                </span>
              ))}
            </Typography>
          </div>
        </div>

        <div
          ref={mediaRef}
          className="relative w-full h-[500px] md:h-auto md:aspect-[16/8] overflow-hidden rounded"
        >
          <Image
            src="/community/communitymobile.png"
            alt={communityContent.image.alt}
            fill
            className="object-cover object-top block md:hidden"
            priority
          />

          <Image
            src={communityContent.image.src}
            alt={communityContent.image.alt}
            fill
            className="hidden object-cover object-center md:block"
            priority
          />

          <div
            className={`absolute bottom-4 left-4 right-4 w-auto max-w-none rounded-xl border border-white/10 bg-white/[0.12] p-4 backdrop-blur-sm transition-all duration-700 ease-out md:bottom-8 md:left-8 md:right-auto md:max-w-xs lg:bottom-12 lg:max-w-lg lg:p-6 xl:bottom-20 xl:max-w-lg xl:p-6 ${inView
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-95 opacity-0"
              }`}
          >
            <div className="mb-2 flex items-center gap-2 md:mb-3 lg:mb-16">
              <span className="h-3 w-3 rounded-full bg-white" />
              <Typography
                variant="body-3"
                as="span"
                className="font-argestadisplay font-light text-white"
              >
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography
              variant="heading-6"
              as="h3"
              className="mb-2 font-tiempos-fine font-normal text-white md:mb-3 lg:mb-6"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography
              variant="body-7"
              as="p"
              className="mb-4 font-argestadisplay font-light text-white md:mb-5 lg:mb-6"
            >
              {communityContent.overlay.description}
            </Typography>

            <button
              type="button"
              onClick={scrollToDonateForm}
              className="inline-flex items-center gap-2 bg-[#FCCC2D] px-5 py-2 transition-colors hover:bg-[#e0b410] md:px-6 md:py-2.5 lg:py-3"
            >
              <Typography
                variant="button-1"
                as="span"
                className="font-manrope font-medium text-[#373737]"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              <ArrowUpRight className="h-5 w-5 text-[#373737]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}