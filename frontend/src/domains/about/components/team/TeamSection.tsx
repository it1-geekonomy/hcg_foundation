"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Typography from "@/lib/Typography";
import { CARD_W_2XL, type Person } from "@/domains/about/constants/teams";
import { ArrowScrollCarousel } from "./ArrowScrollCarousel";
import { CoverflowCarousel } from "./CoverflowCarousel";
import { PersonCard } from "./PersonCard";
import { TeamCarousel } from "./TeamCarousel";
import { personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

export type TeamSectionProps = {
  trustees?: Person[];
  teamMembers?: Person[];
};

/* ---------- Slide-in (same as AboutSection) ---------- */
const LINE_STEP_MS = 120; // delay between consecutive lines
const DESC_DELAY_MS = 250; // description starts slightly after the heading
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

const HEAD_LINE_1 = "Meet the People";
const HEAD_LINE_2 = "Behind the Mission";
const DESC_TEXT =
  "A dedicated team working together to advance cancer awareness, support patients, and build healthier communities through compassion, collaboration, and meaningful impact.";

type HeadWord = { w: string; last: boolean; breakAfter: boolean };

const HEAD_WORDS: HeadWord[] = [
  ...HEAD_LINE_1.split(" ").map((w, i, arr) => ({
    w,
    last: false,
    breakAfter: i === arr.length - 1,
  })),
  ...HEAD_LINE_2.split(" ").map((w, i, arr) => ({
    w,
    last: i === arr.length - 1,
    breakAfter: false,
  })),
];
const DESC_WORDS = DESC_TEXT.split(" ");

function chunkPeople(people: Person[], size: number): Person[][] {
  if (people.length === 0) return [];
  const rows: Person[][] = [];
  for (let i = 0; i < people.length; i += size) {
    rows.push(people.slice(i, i + size));
  }
  return rows;
}

/* Blur reveal, same as the StatSection heading. Plays once. */
function SectionLabel({ label, id }: { label: string; id?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className="mx-auto mb-4 flex max-w-[1260px] items-center justify-center gap-4 md:gap-[22px] lg:mb-24 scroll-mt-24 motion-reduce:!transition-none"
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(14px)",
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,32px,0)",
        transition:
          "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "opacity, filter, transform",
      }}
    >
      <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-l from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
      <Typography
        variant="heading-6"
        as="span"
        className="whitespace-nowrap font-tiempos-headline text-[#382E07]"
      >
        {label}
      </Typography>
      <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-r from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
    </div>
  );
}

export default function TeamSection({
  trustees,
  teamMembers,
}: TeamSectionProps) {
  const allTrustees = trustees ?? [];
  const teamPeople = teamMembers ?? [];
  const trusteeRowsLg = chunkPeople(allTrustees, 3);
  // Only the 2xl grid layout needs to become a carousel when count > 4.
  const teamNeeds2xlCarousel = teamPeople.length > 4;

  const { setRef: setTrusteeLabelRef, height: trusteeLabelHeight } =
    useSyncedLabelHeight(allTrustees.length);
  const { setRef: setTeamGridLabelRef, height: teamGridLabelHeight } =
    useSyncedLabelHeight(teamPeople.length);

  /* ---------- Heading + description slide-in ---------- */
  const headWrapRef = useRef<HTMLDivElement | null>(null);
  const descWrapRef = useRef<HTMLDivElement | null>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const [descVisible, setDescVisible] = useState(false);

  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const descRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [headLines, setHeadLines] = useState<number[]>([]);
  const [descLines, setDescLines] = useState<number[]>([]);

  // Group words into the visual lines they actually wrap into.
  useLayoutEffect(() => {
    const compute = (refs: (HTMLSpanElement | null)[], count: number) => {
      let line = -1;
      let prevTop = -Infinity;
      const lines: number[] = [];
      for (let i = 0; i < count; i++) {
        const top = refs[i]?.offsetTop ?? 0;
        if (top > prevTop + 2) {
          line += 1;
          prevTop = top;
        }
        lines.push(line);
      }
      return lines;
    };

    const measure = () => {
      setHeadLines(compute(headRefs.current, HEAD_WORDS.length));
      setDescLines(compute(descRefs.current, DESC_WORDS.length));
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
    const c2 = watch(descWrapRef.current, setDescVisible);
    return () => {
      c1?.();
      c2?.();
    };
  }, []);

  // Direction comes from the wrapper's --slide-x CSS variable.
  const slideStyle = (
    visible: boolean,
    delayMs: number,
  ): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate3d(0,0,0)"
      : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  });

  return (
    <section className="bg-[#FFF6D8] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:px-6 lg:py-10 xl:px-6 xl:py-20">
      <div className="mx-auto mb-12 flex flex-col gap-5 lg:mb-16 lg:flex-row lg:items-start lg:justify-between lg:gap-[60px] 2xl:px-40">
        {/* Heading: always from the left, line by line */}
        <div
          ref={headWrapRef}
          className="flex items-stretch gap-5 overflow-x-clip [--slide-x:-80px]"
        >
          <span className="w-[3px] flex-none rounded-full bg-[#FCCC2D]" />
          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline text-[#382E07]"
          >
            {HEAD_WORDS.map((f, i) => (
              <Fragment key={i}>
                <span
                  ref={(el) => {
                    headRefs.current[i] = el;
                  }}
                  className="inline-block motion-reduce:!transition-none"
                  style={slideStyle(headVisible, (headLines[i] ?? 0) * LINE_STEP_MS)}
                >
                  {f.w}
                </span>
                {f.breakAfter ? (
                  <>
                    {" "}
                    <br className="hidden lg:block" />
                  </>
                ) : f.last ? (
                  ""
                ) : (
                  " "
                )}
              </Fragment>
            ))}
          </Typography>
        </div>

        {/* Description: from the left when stacked, from the right on lg */}
        <div
          ref={descWrapRef}
          className="w-full overflow-x-clip [--slide-x:-80px] lg:max-w-md lg:[--slide-x:80px]"
        >
          <Typography
            variant="body-3"
            as="p"
            className="w-full font-argestadisplay text-[#596D79]"
          >
            {DESC_WORDS.map((w, i) => (
              <Fragment key={i}>
                <span
                  ref={(el) => {
                    descRefs.current[i] = el;
                  }}
                  className="inline-block motion-reduce:!transition-none"
                  style={slideStyle(
                    descVisible,
                    DESC_DELAY_MS + (descLines[i] ?? 0) * LINE_STEP_MS,
                  )}
                >
                  {w}
                </span>
                {i < DESC_WORDS.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </Typography>
        </div>
      </div>

      {allTrustees.length > 0 ? (
        <>
          <SectionLabel label="Trustees" id="trustees" />
          <div className="-mx-8 mb-10 sm:hidden">
            <CoverflowCarousel people={allTrustees} label="Trustees" />
          </div>
          <div className="mb-4 hidden sm:block lg:hidden">
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
                      key={personKey(p, offset + i)}
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
          <SectionLabel label="Teams" id="team" />
          <div className="-mx-8 mb-4 sm:hidden">
            <CoverflowCarousel people={teamPeople} label="Team members" />
          </div>
          <div className="hidden sm:block lg:hidden">
            <ArrowScrollCarousel people={teamPeople} />
          </div>
          <div className="hidden lg:block 2xl:hidden">
            <TeamCarousel people={teamPeople} />
          </div>

          {teamNeeds2xlCarousel ? (
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
                  key={personKey(p, i)}
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