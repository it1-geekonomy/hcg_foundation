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
  type MutableRefObject,
  type ReactNode,
} from "react";
import Typography from "@/lib/Typography";
import PuzzleImage from "./Puzzleimage";

export interface MissionListBlock {
  /** Optional label above the list, e.g. "Mission:" or "Vision:" */
  title?: string;
  /** Bullet items under this block */
  items: ReactNode[];
}

/** Either a plain paragraph (string/JSX) or a titled bullet list block */
export type MissionContentBlock = ReactNode | MissionListBlock;

export interface MissionHighlightProps {
  /** Optional eyebrow label with a leading dot, e.g. "Our Mission". Omit to hide it. */
  label?: string;
  /** Main heading. Accepts a string or JSX (e.g. with a <br /> line break) */
  heading: ReactNode;
  /**
   * Content blocks, rendered in order. Each entry is either a plain
   * paragraph (string/ReactNode) or a { title?, items } bullet-list block.
   */
  paragraphs: MissionContentBlock[];
  /** Path or URL to the image shown on the right */
  image: string;
  /** Alt text for the image (accessibility / SEO) */
  imageAlt?: string;
  /** Override the section background color/class if needed */
  className?: string;
}

function isListBlock(block: MissionContentBlock): block is MissionListBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    !Array.isArray(block) &&
    "items" in block &&
    Array.isArray((block as MissionListBlock).items)
  );
}

/* ---------- slide-in text animation (inline, always from the left) ---------- */

const LINE_STEP_MS = 120; // delay between consecutive lines
const HEAD_DELAY_MS = 100; // heading starts just after the label
const DESC_DELAY_MS = 250; // body starts after the heading
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

// Direction comes from the --slide-x CSS variable set on the section.
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
  refs: MutableRefObject<(HTMLSpanElement | null)[]>;
  groups: number[]; // groups[i] = paragraph/item the word belongs to
  lines: number[]; // lines[i] = measured visual line of word i
  visible: boolean;
  base: number; // base delay in ms
  count: number; // running word index
};

// Walks a ReactNode and wraps every word in an animatable span.
// Works for strings, fragments and nested elements; <br /> is left untouched.
function splitNode(node: ReactNode, group: number, ctx: SplitCtx): ReactNode {
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
            className="inline-block motion-reduce:!transition-none"
            style={slideStyle(ctx.visible, ctx.base + (ctx.lines[i] ?? 0) * LINE_STEP_MS)}
          >
            {part}
          </span>
        );
      });
  }

  if (Array.isArray(node)) {
    return Children.map(node, (c) => splitNode(c, group, ctx));
  }

  if (isValidElement(node)) {
    if (node.type === "br") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children === undefined) return node;
    return cloneElement(
      node,
      undefined,
      Children.map(children, (c) => splitNode(c, group, ctx)),
    );
  }

  return node;
}

function sameLines(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function MissionHighlight({
  label,
  heading,
  paragraphs,
  image,
  imageAlt = "",
  className = "",
}: MissionHighlightProps) {
  const labelWrapRef = useRef<HTMLDivElement | null>(null);
  const headWrapRef = useRef<HTMLDivElement | null>(null);
  const bodyWrapRef = useRef<HTMLDivElement | null>(null);
  const [labelVisible, setLabelVisible] = useState(false);
  const [headVisible, setHeadVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headGroupsRef = useRef<number[]>([]);
  const bodyGroupsRef = useRef<number[]>([]);
  const [headLines, setHeadLines] = useState<number[]>([]);
  const [bodyLines, setBodyLines] = useState<number[]>([]);

  // Group words into the visual lines they actually wrap into.
  const measure = () => {
    const compute = (refs: (HTMLSpanElement | null)[], groups: number[]) => {
      let line = -1;
      let prevGroup = -1;
      let prevTop = -Infinity;
      return groups.map((g, i) => {
        const top = refs[i]?.offsetTop ?? 0;
        if (g !== prevGroup || top > prevTop + 2) {
          line += 1;
          prevGroup = g;
          prevTop = top;
        }
        return line;
      });
    };

    const h = compute(headRefs.current, headGroupsRef.current);
    const b = compute(bodyRefs.current, bodyGroupsRef.current);
    setHeadLines((prev) => (sameLines(prev, h) ? prev : h));
    setBodyLines((prev) => (sameLines(prev, b) ? prev : b));
  };

  // Re-measure after every render (guarded, so it can't loop) in case the content changed.
  useLayoutEffect(() => {
    measure();
  });

  // Re-measure on resize and once more after late font loads.
  useEffect(() => {
    const t = setTimeout(measure, 150);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const c1 = watch(labelWrapRef.current, setLabelVisible);
    const c2 = watch(headWrapRef.current, setHeadVisible);
    const c3 = watch(bodyWrapRef.current, setBodyVisible);
    return () => {
      c1?.();
      c2?.();
      c3?.();
    };
  }, []);

  // Split heading + body into animatable words (fresh counters every render).
  const headCtx: SplitCtx = {
    refs: headRefs,
    groups: [],
    lines: headLines,
    visible: headVisible,
    base: HEAD_DELAY_MS,
    count: 0,
  };
  const headingContent = splitNode(heading, 0, headCtx);
  headRefs.current.length = headCtx.count;
  headGroupsRef.current = headCtx.groups;

  const bodyCtx: SplitCtx = {
    refs: bodyRefs,
    groups: [],
    lines: bodyLines,
    visible: bodyVisible,
    base: DESC_DELAY_MS,
    count: 0,
  };
  let bodyGroup = 0;
  const bodyContent = paragraphs.map((block, index) => {
    if (isListBlock(block)) {
      const titleGroup = bodyGroup++;
      return (
        <div key={index}>
          {block.title && (
            <Typography
              variant="body-3"
              as="p"
              className="mb-2 font-semibold font-argestadisplay text-[#293239] underline underline-offset-2"
            >
              {splitNode(block.title, titleGroup, bodyCtx)}
            </Typography>
          )}
          <ul className="list-disc space-y-1 pl-5">
            {block.items.map((item, itemIndex) => (
              <Typography
                key={itemIndex}
                variant="body-3"
                as="li"
                className="font-normal font-argestadisplay text-[#293239]"
              >
                {splitNode(item, bodyGroup++, bodyCtx)}
              </Typography>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <Typography
        key={index}
        variant="body-3"
        as="p"
        className="font-normal font-argestadisplay text-[#293239]"
      >
        {splitNode(block as ReactNode, bodyGroup++, bodyCtx)}
      </Typography>
    );
  });
  bodyRefs.current.length = bodyCtx.count;
  bodyGroupsRef.current = bodyCtx.groups;

  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pt-8 pb-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40 [--slide-x:-80px] ${className}`}
    >
      <div className="grid w-full grid-cols-1 items-center lg:grid-cols-2 lg:items-stretch lg:gap-x-4 xl:gap-x-20">
        {/* Label (optional) */}
        {label ? (
          <div
            ref={labelWrapRef}
            className="order-1 mb-6 flex items-center gap-2 motion-reduce:!transition-none lg:order-none lg:col-span-2 lg:row-start-1"
            style={slideStyle(labelVisible, 0)}
          >
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FCCC2D]" />
            <Typography variant="text-1" as="span" className="font-light font-manrope text-[#6F5E09]">
              {label}
            </Typography>
          </div>
        ) : null}

        {/* Heading */}
        <div
          ref={headWrapRef}
          className="order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2"
        >
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline text-[#382E07] font-normal lg:whitespace-nowrap min-[1920px]:whitespace-normal"
          >
            {headingContent}
          </Typography>
        </div>

        {/* Image — row placement:
            - below lg (<1024px): reordered to appear right after the heading (order-3)
            - lg to <1920px: starts at the content/description row
            - 1920px+: starts at the heading row (spans heading+content), regardless of bullet list

            The image itself is rendered as an animated grid of "puzzle pieces"
            (PuzzleImage) that fly in and lock together the moment this section
            scrolls into view. */}
        <div
          className="relative order-3 mt-6 w-full min-w-0 overflow-hidden bg-[#FFF8E2]
            lg:aspect-auto lg:h-full lg:max-h-none lg:min-h-0 lg:self-stretch lg:justify-self-stretch
            lg:order-none lg:col-start-2 lg:mt-0
            lg:row-start-3 lg:row-span-1
            min-[1920px]:!row-start-2 min-[1920px]:!row-span-2"
        >
          {/* Mobile/tablet: natural aspect box, puzzle-piece reveal, no crop */}
          <div className="relative h-64 w-full sm:h-72 md:h-80 lg:hidden">
            <PuzzleImage
              src={image}
              alt={imageAlt}
              rows={3}
              cols={4}
              fit="contain"
              staggerDuration={700}
            />
          </div>
          {/* Desktop (lg+): fills the stretched grid cell, puzzle-piece reveal */}
          <div className="hidden h-full w-full lg:block">
            <PuzzleImage
              src={image}
              alt={imageAlt}
              rows={4}
              cols={5}
              fit="contain"
              staggerDuration={900}
            />
          </div>
        </div>

        {/* Content / paragraphs */}
        <div
          ref={bodyWrapRef}
          className="order-4 mt-2 sm:mt-8 min-w-0 space-y-6 lg:order-none lg:col-start-1 lg:row-start-3"
        >
          {bodyContent}
        </div>
      </div>
    </section>
  );
}