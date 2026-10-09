"use client";

import React, {
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
import Image from "next/image";
import Typography from "@/lib/Typography";

const ART_GALLERY_CARDS = [
  {
    icon: "/Resources/fi_1756784.png",
    title: "Showcase Art",
    description: "Exhibiting quality art pieces from emerging and established artists.",
  },
  {
    icon: "/Resources/Vector (8).png",
    title: "Create Awareness",
    description: "Using art as a medium to spread positivity and hope within the hospital community.",
  },
  {
    icon: "/Resources/Vector (9).png",
    title: "Support a Cause",
    description: "All proceeds help support cancer patients and Foundation initiatives.",
  },
  {
    icon: "/Resources/Vector (10).png",
    title: "Encourage Talent",
    description: "A platform for both up-and-coming and senior artists from across India and abroad.",
  },
];

const PARAGRAPH_CLASS = "font-argestadisplay font-normal text-left text-[#596D79]";
const SUBHEADING_CLASS = "font-argestadisplay font-normal text-[#262626]";
const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------- slide-in text animation (same as InnovationAndTechnology) ------------- */

const LINE_STEP_MS = 120;
const START_DELAY_MS = 100;
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
};

/**
 * One block = one continuous sequence. Every line in the block (across its
 * heading and all its paragraphs) gets its own step, in reading order, so
 * things animate one after another.
 */
function SlideBlock({
  baseDelay = START_DELAY_MS,
  className,
  children,
}: {
  baseDelay?: number;
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
      // small threshold so tall blocks still trigger on short screens
      { threshold: 0.1 },
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

const CARD_STEP_MS = 200;
const CARD_TRANSITION =
  "opacity 700ms ease-out, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";

function cardStyle(visible: boolean, index: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(0,30px,0)",
    transition: CARD_TRANSITION,
    transitionDelay: `${index * CARD_STEP_MS}ms`,
    willChange: "opacity, transform",
  };
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
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

export default function SwasthiArtTherapySection() {
  const { ref: boxRef, visible: cardsVisible } = useInViewOnce<HTMLDivElement>(0.15);

  return (
    <section className="overflow-x-hidden bg-[#FFF8E2] [--slide-x:-80px]">
      <div className={`${CONTAINER} py-2 sm:py-4 lg:py-6 flex flex-col space-y-[2rem] sm:space-y-[2.5rem]`}>
        {/* Title, then intro paragraph (one sequence) */}
        <SlideBlock className="flex flex-col gap-[2rem] sm:gap-[2.5rem]">
          {(split) => (
            <>
              <Typography
                variant="heading-2"
                as="h2"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
              >
                {split("Swasthi Art Gallery & Art Therapy Program", 0)}
              </Typography>

              <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                {split(
                  "Swasthi Art Gallery is HCG Foundation's creative care initiative where art supports patients through their cancer journey. Located within HCG's headquarters at Tower 1, Bengaluru, Swasthi Gallery brings together two connected efforts: a contemporary art gallery that channels the power of art into funding cancer care, and a dedicated Art Therapy program that brings the healing process of art-making directly to patients.",
                  1,
                )}
              </Typography>
            </>
          )}
        </SlideBlock>

        {/* About Swasthi Gallery: heading, then its 2 paragraphs */}
        <SlideBlock className="flex flex-col">
          {(split) => (
            <>
              <Typography variant="heading-8" as="h3" className={SUBHEADING_CLASS}>
                {split("About Swasthi Gallery", 0)}
              </Typography>

              <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                {split(
                  "Launched in 2007, the art space in a hospital gives a positive energy to the patients and their families. Swasthi Art Gallery has been actively involved in organizing art shows, camps and workshops which involve artists coming from across the country and outside.",
                  1,
                )}
              </Typography>

              <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                {split(
                  "The gallery offers a platform to bring forth young upcoming artists and also organizes shows for renowned artists. Swasthi aspires to create a space for art lovers and buyers by exhibiting quality art pieces. They aim at raising funds for the HCG foundation to help support the cancer patients.",
                  2,
                )}
              </Typography>
            </>
          )}
        </SlideBlock>

        {/* Side-by-side Section: Narrative + 2x2 Feature Box */}
        <div className="flex flex-col lg:flex-row gap-[2rem] xl:gap-[3rem] items-start lg:items-center pt-[0.5rem]">
          {/* Left Side: heading + all paragraphs, one sequence */}
          <SlideBlock className="w-full lg:flex-1 flex flex-col">
            {(split) => (
              <>
                <Typography variant="heading-8" as="h3" className={SUBHEADING_CLASS}>
                  {split("Art Therapy: Healing Through the Creative Process", 0)}
                </Typography>

                <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                  {split(
                    "In 2018, Swasthi Art Gallery extended its mission from the gallery walls to direct patient care with the launch of its Art Therapy program at HCG Bangalore hospital. Art therapy is a form of expressive therapy that uses the creative process of making art to support a patient's physical, mental, and emotional wellbeing.",
                    1,
                  )}
                </Typography>

                <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                  {split(
                    "Every session is built around the individual. A typical session unfolds in three parts:",
                    2,
                  )}
                </Typography>

                <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                  {split(
                    <>
                      • <span className="font-normal text-[#262626]">Pre-art conversation</span> : the pre-art component is crucial, especially for the first meeting between the art therapist and the patient. This allows the therapist to get to know and assess the patient
                    </>,
                    3,
                  )}
                </Typography>

                <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                  {split(
                    <>
                      • <span className="font-normal text-[#262626]">The creative process</span> : the second part is the actual creative process, or the making of a piece or pieces of art. The therapist may teach the patient some art techniques, but the most important thing is to simply create something...
                    </>,
                    4,
                  )}
                </Typography>

                <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                  {split(
                    <>
                      • <span className="font-normal text-[#262626]">Post-art reflection</span> : Patient and therapist discuss the finished piece together, the patient is expected to talk about their feelings, what led them to create that art, how they felt while making the art and their thoughts post completing it.
                    </>,
                    5,
                  )}
                </Typography>
              </>
            )}
          </SlideBlock>

          {/* Right Side: 2x2 Feature Box (Figma Rectangle 1673: 762px x 597px) */}
          <div
            ref={boxRef}
            className="w-full lg:w-[48%] xl:w-[47.625rem] lg:max-w-none xl:max-w-[47.625rem] h-auto sm:h-[37.3125rem] shrink-0 mx-auto lg:mx-0"
          >
            <div className="w-full h-full rounded-[0.375rem] border border-[#FFECC5] bg-gradient-to-b from-[#FFFBEE] to-[#FEF3D3] p-[1.5rem] sm:p-[2rem] xl:p-[3rem] grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 relative">
              {/* Center Vertical Divider */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%-4rem)] max-h-[31.6296rem] w-[0.0625rem] z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                }}
              />

              {/* Center Horizontal Divider */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-4rem)] max-w-[26.4375rem] h-[0.0625rem] z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                }}
              />

              {ART_GALLERY_CARDS.map((card, index) => {
                const isFirstRow = index < 2;
                const isFirstCol = index % 2 === 0;

                return (
                  <React.Fragment key={card.title}>
                    <div
                      className={`flex flex-col justify-center motion-reduce:!transition-none ${
                        isFirstCol ? "sm:pr-[2rem] xl:pr-[2.5rem]" : "sm:pl-[2rem] xl:pl-[2.5rem]"
                      } ${
                        isFirstRow ? "sm:pb-[2rem] xl:pb-[2.5rem]" : "sm:pt-[2rem] xl:pt-[2.5rem]"
                      } py-4 sm:py-0`}
                      style={cardStyle(cardsVisible, index)}
                    >
                      {/* Icon Circle */}
                      <div className="w-[5.0625rem] h-[5.0625rem] rounded-full bg-[#F0DEB8] flex items-center justify-center shrink-0">
                        <Image
                          src={card.icon}
                          alt={card.title}
                          width={43}
                          height={43}
                          className="w-[2.6875rem] h-[2.6875rem] object-contain"
                        />
                      </div>

                      {/* Card Title */}
                      <div className="mt-[1rem]">
                        <Typography
                          variant="heading-8"
                          as="h4"
                          className="font-argestadisplay font-normal text-left text-[#000000]"
                        >
                          {card.title}
                        </Typography>
                      </div>

                      {/* Card Description */}
                      <div className="mt-[0.5rem] max-w-[18.5625rem]">
                        <Typography
                          variant="body-7"
                          as="p"
                          className="font-manrope font-medium text-left text-[#606060]"
                        >
                          {card.description}
                        </Typography>
                      </div>
                    </div>

                    {/* Mobile Fading Divider */}
                    {index !== ART_GALLERY_CARDS.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="sm:hidden w-full max-w-[18rem] mx-auto h-[0.0625rem] my-[0.75rem]"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Closing Paragraphs */}
        <SlideBlock className="flex flex-col pt-[0.5rem]">
          {(split) => (
            <>
              <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                {split(
                  "Sessions can be individual, group, or family based allowing patients to process their experience alongside fellow patients navigating the same journey, always with the choice to share only what feels comfortable.",
                  0,
                )}
              </Typography>

              <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
                {split(
                  "Together, Swasthi Gallery and Art Therapy reflect HCG Foundation's belief that cancer care extends beyond medicine. One raises the funds that make patient support possible; the other puts the healing power of art directly into patient's hands.",
                  1,
                )}
              </Typography>
            </>
          )}
        </SlideBlock>
      </div>
    </section>
  );
}