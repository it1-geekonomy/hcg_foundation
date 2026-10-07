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
  DEFAULT_BLOCKS,
  HEART_ICON,
} from "@/domains/ourprograms/PinkHopeSupportGroup/constants/whypatientsjoinus";

/* ---------------------------- types ---------------------------- */

export interface SupportParagraph {
  /** Underlined lead-in, e.g. "A sense of belonging:" */
  label?: string;
  text: ReactNode;
}

export interface SupportGroupBlock {
  heading: ReactNode;
  paragraphs?: SupportParagraph[];
  /** Bullet items rendered with the pink heart icon */
  bullets?: ReactNode[];
}

export interface SupportGroupSectionProps {
  /** Optional. Falls back to the default Pink Hope content. */
  blocks?: SupportGroupBlock[];
  /** Heart icon used for bullets */
  iconSrc?: string;
  className?: string;
}

/* ------------- slide-in animation (same as MissionHighlight) ------------- */

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

/* ------------- one animated unit: measures lines, plays once in view ------------- */

type Splitter = {
  (node: ReactNode, group: number, wordClass?: string): ReactNode;
  /** Slide style for non-text elements (e.g. icons), timed with the first line of the given group */
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

/* ---------------------------- section ---------------------------- */

export default function SupportGroupSection({
  blocks = DEFAULT_BLOCKS,
  iconSrc = HEART_ICON,
  className = "",
}: SupportGroupSectionProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] px-8 sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40 [--slide-x:-80px] ${className}`}
    >
      <div className="flex w-full flex-col gap-4 lg:gap-6 xl:gap-14">
        {blocks.map((block, bi) => (
          <div key={bi} className="min-w-0">
            {/* Heading */}
            <SlideBlock baseDelay={HEAD_DELAY_MS}>
              {(split) => (
                <Typography
                  variant="heading-7"
                  as="h2"
                  className="font-tiempos-headline text-[#000000] font-normal italic"
                >
                  {split(block.heading, 0)}
                </Typography>
              )}
            </SlideBlock>

            {/* Paragraphs */}
            {block.paragraphs && block.paragraphs.length > 0 && (
              <SlideBlock
                baseDelay={DESC_DELAY_MS}
                className="mt-4 min-w-0 space-y-4 sm:mt-5 sm:space-y-5"
              >
                {(split) =>
                  block.paragraphs!.map((p, pi) => (
                    <Typography
                      key={pi}
                      variant="body-3"
                      as="p"
                      className="font-normal font-argestadisplay text-[#293239]"
                    >
                      {p.label && (
                        <>
                          {split(p.label, pi * 2, "underline underline-offset-2")}{" "}
                        </>
                      )}
                      {split(p.text, pi * 2 + 1)}
                    </Typography>
                  ))
                }
              </SlideBlock>
            )}

            {/* Heart bullets */}
            {block.bullets && block.bullets.length > 0 && (
              <SlideBlock baseDelay={DESC_DELAY_MS} className="mt-4 min-w-0 sm:mt-5">
                {(split) => (
                  <ul className="space-y-4 sm:space-y-5 lg:space-y-6">
                    {block.bullets!.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-3 sm:gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={iconSrc}
                          alt=""
                          aria-hidden
                          width={18}
                          height={16}
                          className="mt-[0.35em] h-3.5 w-auto shrink-0 sm:h-4 motion-reduce:!transition-none"
                          style={split.slideWith(ii)}
                        />
                        <Typography
                          variant="body-3"
                          as="span"
                          className="min-w-0 font-normal font-argestadisplay text-[#293239]"
                        >
                          {split(item, ii)}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                )}
              </SlideBlock>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}