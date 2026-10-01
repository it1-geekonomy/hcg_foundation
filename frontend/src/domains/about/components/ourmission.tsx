"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import {
  MISSION_ITEMS,
  VISION_ITEMS,
  GRID_IMAGES,
  BAR_GRADIENT,
} from "@/domains/about/constants/visionsection";

/* ---------- Animation helpers ---------- */
const LINE_STEP_MS = 120; // delay between consecutive heading lines
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
const BLUR_TRANSITION =
  "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)";
const SCATTER_TRANSITION =
  "opacity 700ms ease-out, transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)";

/* Where each grid image starts from before settling into place.
   Fixed values (not Math.random) so server and client render identically. */
const GRID_SCATTER = [
  { x: -140, y: -90, rotate: -14, delay: 0 },
  { x: 150, y: -110, rotate: 12, delay: 160 },
  { x: 0, y: 130, rotate: -6, delay: 320 },
  { x: -160, y: 100, rotate: 10, delay: 80 },
  { x: 140, y: 120, rotate: -12, delay: 240 },
];

// Plays once: flips to true the first time the element scrolls into view.
function useInViewOnce<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T | null>(null);
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
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// Slide in from the left (HopeSection heading style)
const slideStyle = (visible: boolean, delayMs = 0): CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translate3d(0,0,0)" : "translate3d(-80px,0,0)",
  transition: SLIDE_TRANSITION,
  transitionDelay: `${delayMs}ms`,
  willChange: "opacity, transform",
});

// Blur reveal (StatSection heading style)
const blurRevealStyle = (visible: boolean): CSSProperties => ({
  opacity: visible ? 1 : 0,
  filter: visible ? "blur(0px)" : "blur(14px)",
  transform: visible ? "translate3d(0,0,0)" : "translate3d(0,32px,0)",
  transition: BLUR_TRANSITION,
  willChange: "opacity, filter, transform",
});

// Fly in from a scattered spot and settle into the grid
const scatterStyle = (visible: boolean, index: number): CSSProperties => {
  const s = GRID_SCATTER[index];
  return {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate3d(0,0,0) rotate(0deg) scale(1)"
      : `translate3d(${s.x}px,${s.y}px,0) rotate(${s.rotate}deg) scale(0.85)`,
    transition: SCATTER_TRANSITION,
    transitionDelay: `${s.delay}ms`,
    willChange: "opacity, transform",
  };
};

/* Splits text into words, measures which visual line each word wraps onto,
   and slides each line in from the left one after another. */
function SlideWords({
  text,
  visible,
  delayMs = 0,
}: {
  text: string;
  visible: boolean;
  delayMs?: number;
}) {
  const words = text.split(" ");
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<number[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      let line = 0;
      let prevTop = refs.current[0]?.offsetTop ?? 0;
      const next = words.map((_, i) => {
        const top = refs.current[i]?.offsetTop ?? 0;
        if (top > prevTop + 2) {
          line += 1;
          prevTop = top;
        }
        return line;
      });
      setLines(next);
    };

    measure();
    const t = setTimeout(measure, 150); // late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="inline-block motion-reduce:!transition-none"
            style={slideStyle(visible, delayMs + (lines[i] ?? 0) * LINE_STEP_MS)}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

/* ---------- Small icon + text row ---------- */
function IconItem({ icon, text }: { icon: string; text: string }) {
  const parts = text.split("|");
  const { ref, visible } = useInViewOnce<HTMLLIElement>(0.3);

  return (
    <li
      ref={ref}
      className="flex items-center gap-4 motion-reduce:!transition-none lg:items-start lg:gap-3 xl:gap-4"
      style={blurRevealStyle(visible)}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFE59B] sm:h-16 sm:w-16 lg:h-12 lg:w-12 xl:h-16 xl:w-16">
        <Image
          src={icon}
          alt=""
          width={28}
          height={28}
          className="h-6 w-6 object-contain sm:h-10 sm:w-10 lg:h-7 lg:w-7 xl:h-10 xl:w-10"
        />
      </span>
      {/* lg+: text block is at least as tall as the icon and centered inside it,
          so short text lines up with the icon and long text starts at the icon's top */}
      <div className="min-w-0 flex-1 lg:flex lg:min-h-12 lg:items-center xl:min-h-16">
        <Typography
          variant="body-2"
          as="p"
          className="text-left font-argestadisplay font-normal text-[#000000] xl:[text-wrap:balance]"
        >
          {parts.map((part, i) => (
            <Fragment key={i}>
              {part}
              {i < parts.length - 1 && " "}
            </Fragment>
          ))}
        </Typography>
      </div>
    </li>
  );
}

/* ---------- Gradient title bar with main icon ---------- */
function TitleBar({ icon, title }: { icon: string; title: string }) {
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 px-3 py-3 motion-reduce:!transition-none sm:max-w-[320px]"
      style={{ background: BAR_GRADIENT, ...slideStyle(visible) }}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C0A554] sm:h-12 sm:w-12">
        <Image
          src={icon}
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 object-contain sm:h-8 sm:w-8"
        />
      </span>
      <Typography
        variant="body-1"
        as="h3"
        className="font-tiempos-fine font-normal italic text-[#272727]"
      >
        {title}
      </Typography>
    </div>
  );
}

export interface MissionVisionProps {
  className?: string;
}

export default function MissionVision({ className = "" }: MissionVisionProps) {
  const label = useInViewOnce<HTMLDivElement>(0.25);
  const heading = useInViewOnce<HTMLDivElement>(0.25);
  const grid = useInViewOnce<HTMLDivElement>(0.2);

  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pt-8 pb-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
     
      <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_500px]">
        {/* lg:contents lets the label and heading become separate grid items at lg+ */}
        <div className="lg:contents">
          {/* ---------- Label ---------- */}
          <div
            ref={label.ref}
            className="flex items-center gap-2 mb-3 motion-reduce:!transition-none lg:col-start-1 lg:row-start-1"
            style={slideStyle(label.visible)}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FCCC2D]" />
            <Typography
              variant="body-7"
              as="span"
              className="font-manrope font-normal text-[#6F5E09]"
            >
              Our Mission &amp; Vision
            </Typography>
          </div>

          {/* ---------- Heading (wrapper carries the grid placement + width) ---------- */}
          <div
            ref={heading.ref}
            className="lg:col-start-1 lg:row-start-2 lg:max-w-xl"
          >
            <Typography
              variant="heading-2"
              as="h2"
              className="max-w-none font-tiempos-headline text-[#382E07]"
            >
              <SlideWords
                text="Care, Hope & Healing for Every Patient"
                visible={heading.visible}
                delayMs={LINE_STEP_MS}
              />
            </Typography>
          </div>
        </div>

        {/* ---------- Image grid ---------- */}
        <div
          ref={grid.ref}
          className="mx-auto grid w-full max-w-[360px] grid-cols-2 content-start gap-2 self-start md:max-w-[480px] lg:col-start-2 lg:row-start-3 lg:mx-0 lg:max-w-none lg:self-center 2xl:row-span-2 2xl:row-start-2 2xl:self-start"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden motion-reduce:!transition-none"
            style={scatterStyle(grid.visible, 0)}
          >
            <Image
              src={GRID_IMAGES[0]}
              alt=""
              fill
              sizes="(min-width: 1280px) 250px, (min-width: 1024px) 170px, 50vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative aspect-[4/3] overflow-hidden motion-reduce:!transition-none"
            style={scatterStyle(grid.visible, 1)}
          >
            <Image
              src={GRID_IMAGES[1]}
              alt=""
              fill
              sizes="(min-width: 1280px) 250px, (min-width: 1024px) 170px, 50vw"
              className="object-cover"
            />
          </div>

          <div
            className="relative col-span-2 aspect-[16/9] overflow-hidden motion-reduce:!transition-none"
            style={scatterStyle(grid.visible, 2)}
          >
            <Image
              src={GRID_IMAGES[2]}
              alt=""
              fill
              sizes="(min-width: 1280px) 500px, (min-width: 1024px) 380px, 100vw"
              className="object-cover"
            />
          </div>

          <div
            className="relative aspect-[4/3] overflow-hidden motion-reduce:!transition-none"
            style={scatterStyle(grid.visible, 3)}
          >
            <Image
              src={GRID_IMAGES[3]}
              alt=""
              fill
              sizes="(min-width: 1280px) 250px, (min-width: 1024px) 170px, 50vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative aspect-[4/3] overflow-hidden motion-reduce:!transition-none"
            style={scatterStyle(grid.visible, 4)}
          >
            <Image
              src={GRID_IMAGES[4]}
              alt=""
              fill
              sizes="(min-width: 1280px) 250px, (min-width: 1024px) 170px, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* ---------- Mission + Vision contents ---------- */}
        <div className="lg:col-start-1 lg:row-start-3 lg:mt-6 lg:self-center 2xl:self-auto">
          {/* Mission */}
          <TitleBar icon="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835195947-56yv3-fi_7198217.webp" title="Our Mission" />

          {/* Column flow: first 3 items fill col 1, last 3 fill col 2.
              lg:items-start pins each row's items to the same top edge. */}
          <ul className="mt-8 grid grid-cols-1 items-center gap-x-8 gap-y-6 sm:auto-rows-fr sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3 lg:auto-rows-auto lg:grid-flow-row lg:grid-cols-1 lg:grid-rows-none lg:items-start lg:gap-x-6 xl:auto-rows-fr xl:grid-flow-col xl:grid-cols-2 xl:grid-rows-3 xl:gap-x-8">
            {MISSION_ITEMS.map((item) => (
              <IconItem key={item.icon} {...item} />
            ))}
          </ul>

          {/* Vision */}
          <div className="mt-12 lg:hidden xl:block">
            <TitleBar icon="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835289594-mb01b-fi_1078327.webp" title="Our Vision" />

            <ul className="mt-8 grid grid-cols-1 items-center gap-x-8 gap-y-6 sm:grid-cols-2 lg:items-start lg:gap-x-6 xl:gap-x-8">
              {VISION_ITEMS.map((item) => (
                <IconItem key={item.icon} {...item} />
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Vision, lg only: full width, 2 partitions ---------- */}
        <div className="hidden lg:col-span-2 lg:row-start-4 lg:mt-10 max-w-4xl lg:block xl:hidden">
          <TitleBar icon="/ourvision/visionicon.png" title="Our Vision" />

          <ul className="mt-8 grid grid-cols-2 items-start gap-x-6 gap-y-6">
            {VISION_ITEMS.map((item) => (
              <IconItem key={item.icon} {...item} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}