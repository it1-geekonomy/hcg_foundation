"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Typography from "@/lib/Typography";
import {
  INNOVATION_CONTENT,
  INNOVATION_COMPANIES,
  INNOVATION_CARD_STYLE,
} from "@/domains/ourprograms/ResearchAndInnovation/constants/innovation";

/* ------------- slide-in text animation (same as WhyPatientsJoinUs) ------------- */

const LINE_STEP_MS = 120;
const HEAD_DELAY_MS = 100;
const DESC_DELAY_MS = 250;
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

// Direction comes from the --slide-x CSS variable set on the section (always from the left).
function slideStyle(visible: boolean, delayMs: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  };
}

type SplitCtx = {
  refs: { current: (HTMLSpanElement | null)[] };
  groups: number[];
  lines: number[];
  visible: boolean;
  base: number;
  count: number;
};

function splitNode(
  node: ReactNode,
  group: number,
  ctx: SplitCtx,
  wordClass = "",
): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return null;

  if (typeof node === "string" || typeof node === "number") {
    return String(node)
      .split(/(\s+)/)
      .map((part, k) => {
        if (part === "") return null;
        if (/^\s+$/.test(part)) return part;
        const i = ctx.count++;
        ctx.groups[i] = group;
        return (
          <span
            key={k}
            ref={(el) => {
              ctx.refs.current[i] = el;
            }}
            className={`inline-block motion-reduce:!transition-none ${wordClass}`}
            style={slideStyle(ctx.visible, ctx.base + (ctx.lines[i] ?? 0) * LINE_STEP_MS)}
          >
            {part}
          </span>
        );
      });
  }

  if (Array.isArray(node)) {
    return Children.map(node, (c) => splitNode(c, group, ctx, wordClass));
  }

  if (isValidElement(node)) {
    if (node.type === "br") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children === undefined) return node;
    return cloneElement(
      node,
      undefined,
      Children.map(children, (c) => splitNode(c, group, ctx, wordClass)),
    );
  }

  return node;
}

function sameLines(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

type Splitter = {
  (node: ReactNode, group: number, wordClass?: string): ReactNode;
  slideWith: (group: number) => CSSProperties;
};

function SlideBlock({
  baseDelay,
  className,
  children,
}: {
  baseDelay: number;
  className?: string;
  children: (split: Splitter) => ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const groupsRef = useRef<number[]>([]);
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<number[]>([]);

  const measure = () => {
    let line = -1;
    let prevGroup = -1;
    let prevTop = -Infinity;
    const next = groupsRef.current.map((g, i) => {
      const top = refs.current[i]?.offsetTop ?? 0;
      if (g !== prevGroup || top > prevTop + 2) {
        line += 1;
        prevGroup = g;
        prevTop = top;
      }
      return line;
    });
    setLines((prev) => (sameLines(prev, next) ? prev : next));
  };

  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const t = setTimeout(measure, 150);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const ctx: SplitCtx = {
    refs,
    groups: [],
    lines,
    visible,
    base: baseDelay,
    count: 0,
  };
  const split = ((node: ReactNode, group: number, wordClass?: string) =>
    splitNode(node, group, ctx, wordClass)) as Splitter;
  split.slideWith = (group: number) => {
    const firstWord = groupsRef.current.indexOf(group);
    const line = firstWord >= 0 ? (lines[firstWord] ?? 0) : 0;
    return slideStyle(visible, baseDelay + line * LINE_STEP_MS);
  };

  const content = children(split);
  refs.current.length = ctx.count;
  groupsRef.current = ctx.groups;

  return (
    <div ref={wrapRef} className={className}>
      {content}
    </div>
  );
}

/* ------------- card reveal animation (staggered fade-up, plays once) ------------- */

const CARD_STEP_MS = 150;
const CARD_TRANSITION =
  "opacity 700ms ease-out, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";

function cardStyle(visible: boolean, index: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate3d(0,0,0) scale(1)"
      : "translate3d(0,40px,0) scale(0.97)",
    transition: CARD_TRANSITION,
    transitionDelay: `${index * CARD_STEP_MS}ms`,
    willChange: "opacity, transform",
  };
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ---------------------------- section ---------------------------- */

export default function InnovationAndTechnology() {
  const { ref: gridRef, visible: cardsVisible } = useInViewOnce<HTMLDivElement>(0.1);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] py-2 md:py-2 px-8 sm:px-12 md:px-16 lg:py-4 xl:py-4 lg:px-6 xl:px-6 2xl:px-40 [--slide-x:-80px]">
      {/* Heading + description */}
      <div className="flex flex-col gap-4">
        <SlideBlock baseDelay={HEAD_DELAY_MS}>
          {(split) => (
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline italic text-[#0D2838]"
            >
              {split(INNOVATION_CONTENT.heading, 0)}
            </Typography>
          )}
        </SlideBlock>

        <SlideBlock
          baseDelay={DESC_DELAY_MS}
          className="flex min-w-0 flex-col gap-4 md:gap-6"
        >
          {(split) =>
            INNOVATION_CONTENT.paragraphs.map((text, i) => (
              <Typography
                key={i}
                variant="body-3"
                as="p"
                className="font-normal font-argestadisplay text-[#293239]"
              >
                {split(text, i)}
              </Typography>
            ))
          }
        </SlideBlock>
      </div>

      {/* Companies */}
      <div className="mt-2 sm:mt-4 lg:mt-6 xl:mt-8">
        <SlideBlock baseDelay={HEAD_DELAY_MS}>
          {(split) => (
            <Typography
              variant="heading-7"
              as="h3"
              className="font-tiempos-headline font-light text-[#000000]"
            >
              {split(INNOVATION_CONTENT.companiesHeading, 0)}
            </Typography>
          )}
        </SlideBlock>

        <div
          ref={gridRef}
          className="mt-[clamp(1rem,2vw,1.5rem)] grid grid-cols-1 gap-[clamp(1rem,2vw,1.5rem)] sm:grid-cols-2 xl:grid-cols-4"
        >
          {INNOVATION_COMPANIES.map((company, idx) => (
            <article
              key={company.id}
              className="flex h-full flex-col gap-4 rounded-sm border border-[#F0E5C1] bg-gradient-to-b p-[clamp(1rem,2vw,1.5rem)] motion-reduce:!transition-none"
              style={{
                borderColor: INNOVATION_CARD_STYLE.border,
                // Tailwind arbitrary gradient stops can't be built dynamically, so set them inline
                backgroundImage: `linear-gradient(to bottom, ${INNOVATION_CARD_STYLE.gradientFrom}, ${INNOVATION_CARD_STYLE.gradientTo})`,
                ...cardStyle(cardsVisible, idx),
              }}
            >
              {/* Fixed-height logo slot so titles line up across cards */}
              <div className="flex h-8 sm:h-10 lg:h-14 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  loading="lazy"
                  className="max-h-full w-auto max-w-[70%] object-contain object-left"
                />
              </div>

              <Typography
                variant="heading-7"
                as="h4"
                className="font-manrope font-medium text-[#000000]"
              >
                {company.name}
              </Typography>

              <Typography
                variant="body-6"
                as="p"
                className="font-normal font-argestadisplay text-[#293239] !text-left"
              >
                {company.description}
              </Typography>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}