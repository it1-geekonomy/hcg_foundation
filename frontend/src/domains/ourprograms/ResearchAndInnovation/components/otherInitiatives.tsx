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
import PuzzleImage from "@/shared/components/Puzzleimage"; // adjust path/alias if needed
import { OTHER_INITIATIVES_CONTENT } from "@/domains/ourprograms/ResearchAndInnovation/constants/otherInitiatives";

/** width / height of the milestone image (~1.22 from the screenshots). Set to the real value. */
const IMAGE_ASPECT = 1.22;

/* ------------- slide-in text animation (same as InnovationAndTechnology) ------------- */

const LINE_STEP_MS = 120;
const HEAD_DELAY_MS = 100;
const DESC_DELAY_MS = 250;
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

// Direction comes from the --slide-x CSS variable (negative = from the left, positive = from the right).
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

/* ---------------------------- section ---------------------------- */

const PARA_CLASS =
  "font-normal font-argestadisplay text-[#293239] !text-left";

export default function OtherInitiatives() {
  const { heading, introParagraphs, image, milestoneParagraphs } =
    OTHER_INITIATIVES_CONTENT;

  // First 3 paras go beside the image on lg; the rest sit below it.
  const firstParas = milestoneParagraphs.slice(0, 3);
  const restParas = milestoneParagraphs.slice(3);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] py-2 md:py-2 px-8 sm:px-12 md:px-16 lg:py-4 xl:py-4 lg:px-6 xl:px-6 2xl:px-40 [--slide-x:-80px]">
      {/* Heading + 2 intro paragraphs (always from the left) */}
      <div className="flex flex-col gap-4">
        <SlideBlock baseDelay={HEAD_DELAY_MS}>
          {(split) => (
            <Typography
              variant="heading-7"
              as="h2"
              className="font-tiempos-headline font-normal italic text-[#000000]"
            >
              {split(heading, 0)}
            </Typography>
          )}
        </SlideBlock>

        <SlideBlock
          baseDelay={DESC_DELAY_MS}
          className="flex min-w-0 flex-col gap-4 md:gap-6"
        >
          {(split) =>
            introParagraphs.map((text, i) => (
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

      {/*
        Layouts:
        - below lg : single column -> image (centered, small), paras 1-3, para 4
        - lg only  : image on the left, paras 1-3 on the right, para 4 below (full width)
        - xl and up: image on the left (centered against the text), all paras on the right
      */}
      <div className="mt-[clamp(2rem,5vw,4rem)] grid grid-cols-1 gap-x-[clamp(1.25rem,2.5vw,2rem)] gap-y-4 md:gap-y-6 lg:max-xl:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr]">
        {/* Image */}
        <div
          className="w-[clamp(220px,50vw,380px)] max-w-full justify-self-center lg:max-xl:w-[clamp(300px,42vw,420px)] lg:max-xl:justify-self-start lg:max-xl:self-start lg:max-xl:[grid-area:1/1] xl:w-[clamp(380px,32vw,520px)] xl:justify-self-start xl:self-center xl:[grid-area:1/1/3/2]"
          style={{ aspectRatio: IMAGE_ASPECT }}
        >
          <PuzzleImage src={image.src} alt={image.alt} fit="contain" />
        </div>

        {/* Paras 1-3: from the left (stacked + lg), from the right on xl+ */}
        <SlideBlock
          baseDelay={DESC_DELAY_MS}
          className="flex min-w-0 flex-col gap-4 md:gap-6 [--slide-x:-80px] xl:[--slide-x:80px] lg:max-xl:[grid-area:1/2] xl:[grid-area:1/2]"
        >
          {(split) =>
            firstParas.map((text, i) => (
              <Typography key={i} variant="body-3" as="p" className={PARA_CLASS}>
                {split(text, i)}
              </Typography>
            ))
          }
        </SlideBlock>

        {/* Para 4: full width below the image on lg, right column on xl+ */}
        {restParas.length > 0 && (
          <SlideBlock
            baseDelay={DESC_DELAY_MS}
            className="flex min-w-0 flex-col gap-4 md:gap-6 [--slide-x:-80px] xl:[--slide-x:80px] lg:max-xl:[grid-area:2/1/3/3] xl:[grid-area:2/2]"
          >
            {(split) =>
              restParas.map((text, i) => (
                <Typography key={i} variant="body-3" as="p" className={PARA_CLASS}>
                  {split(text, i)}
                </Typography>
              ))
            }
          </SlideBlock>
        )}
      </div>
    </section>
  );
}