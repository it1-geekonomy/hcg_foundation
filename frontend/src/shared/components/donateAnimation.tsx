"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, PointerEvent, ReactNode } from "react";
import { LayoutGroup, animate, motion, useReducedMotion } from "framer-motion";

/*
 * Donate card motion.
 *
 *   0.1s   a gold thread draws the card's outline from the side facing the hands
 *   0.45s  the glass lights up as a band of light sweeps across it
 *   0.75s  rows unfold upright in 3D, one after another
 *          the heading flips in letter by letter, amounts roll in like an odometer
 *   2.2s   one sheen across the Donate button
 *   after  on pointer devices the border glows wherever the cursor is
 *
 * The photo behind the card is intentionally left untouched.
 * Interaction: amounts re-roll when the currency changes, the gold pill glides
 * between amounts, and the Donate button glows once the form is ready.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
const GOLD = "252, 204, 45";

const TRACE = { delay: 0.1, duration: 1.3, fadeDelay: 1.7, fadeDuration: 0.8 };
const GLASS = { delay: 0.45, duration: 0.8, sweepDelay: 0.55, sweepDuration: 1.3 };
const ROW = { start: 0.75, stagger: 0.09 };
const HEADING_DELAY = 0.9;
const AMOUNTS_DELAY = 1.05;
const CTA_SHEEN_DELAY = 2.2;

const UNFOLD = { type: "spring", stiffness: 130, damping: 17, mass: 0.9 } as const;

type Origin = "left" | "top";

const instant = { duration: 0 };

/* ---------- Shared state ---------- */
type DonateMotionState = {
  /** The section has entered the viewport at least once (intro plays once). */
  inView: boolean;
  /** The section is on screen right now (looping effects only run then). */
  live: boolean;
  /** prefers-reduced-motion */
  skip: boolean;
};

const DonateMotionContext = createContext<DonateMotionState>({
  inView: false,
  live: false,
  skip: false,
});
const useDonateMotion = () => useContext(DonateMotionContext);

export function useSectionInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const intro = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          intro.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    const presence = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting));

    intro.observe(el);
    presence.observe(el);
    return () => {
      intro.disconnect();
      presence.disconnect();
    };
  }, []);

  return { ref, inView, live };
}

export function DonateMotionProvider({
  inView,
  live,
  children,
}: {
  inView: boolean;
  live: boolean;
  children: ReactNode;
}) {
  const skip = useReducedMotion() === true;
  return (
    <DonateMotionContext.Provider value={{ inView, live, skip }}>
      {children}
    </DonateMotionContext.Provider>
  );
}

/* ---------- 1. Gold thread draws the card outline ---------- */
function useElementSize<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

/* Two halves start together at the origin side and meet on the opposite side. */
function tracePaths(origin: Origin, w: number, h: number): [string, string] {
  const i = 1; // keep the stroke inside the clipped card edge
  const [l, t, r, b] = [i, i, w - i, h - i];
  if (origin === "left") {
    const my = h / 2;
    return [
      `M${l} ${my} L${l} ${t} L${r} ${t} L${r} ${my}`,
      `M${l} ${my} L${l} ${b} L${r} ${b} L${r} ${my}`,
    ];
  }
  const mx = w / 2;
  return [
    `M${mx} ${t} L${l} ${t} L${l} ${b} L${mx} ${b}`,
    `M${mx} ${t} L${r} ${t} L${r} ${b} L${mx} ${b}`,
  ];
}

function BorderTrace({ origin }: { origin: Origin }) {
  const { inView, skip } = useDonateMotion();
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  if (skip) return null;

  const paths = width && height ? tracePaths(origin, width, height) : null;

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      {paths ? (
        <motion.svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 overflow-visible"
          style={{ filter: `drop-shadow(0 0 5px rgba(${GOLD}, 0.85))` }}
          initial={{ opacity: 1 }}
          animate={{ opacity: inView ? 0 : 1 }}
          transition={{ duration: TRACE.fadeDuration, ease: EASE, delay: TRACE.fadeDelay }}
        >
          {paths.map((d) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke={`rgb(${GOLD})`}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: TRACE.duration, ease: EASE_IN_OUT, delay: TRACE.delay }}
            />
          ))}
        </motion.svg>
      ) : null}
    </div>
  );
}

/* ---------- 2. Glass lights up; afterwards the border follows the cursor ---------- */
const RING_MASK = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

export function DonateCard({
  origin,
  glassColor,
  className = "",
  style,
  children,
}: {
  /** The side facing the hands in the photo; the thread and glass start here. */
  origin: Origin;
  glassColor: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  const shown = inView || skip;

  const trackPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className={`group/donate relative isolate ${className}`}
      style={{ ...style, perspective: "1200px" }}
      onPointerMove={trackPointer}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded border border-white/15 backdrop-blur-md"
        style={{ backgroundColor: glassColor }}
        initial={skip ? false : { opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={skip ? instant : { duration: GLASS.duration, ease: EASE, delay: GLASS.delay }}
      />

      {skip ? null : (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-1/4 left-0 z-10 w-1/2 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-130%" }}
          animate={{ x: shown ? "330%" : "-130%" }}
          transition={{ duration: GLASS.sweepDuration, ease: EASE_IN_OUT, delay: GLASS.sweepDelay }}
        />
      )}

      {/* Cursor spotlight: a soft glare on the glass and a gold glow on the edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded opacity-0 transition-opacity duration-500 group-hover/donate:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.07), transparent 55%)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded p-px opacity-0 transition-opacity duration-500 group-hover/donate:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(${GOLD}, 0.95), rgba(${GOLD}, 0) 65%)`,
          WebkitMask: RING_MASK,
          WebkitMaskComposite: "xor",
          mask: RING_MASK,
          maskComposite: "exclude",
        }}
      />

      <BorderTrace origin={origin} />
      {/* Scopes the amount pill's layoutId to this card (the form renders twice). */}
      <LayoutGroup id={`donate-${origin}`}>{children}</LayoutGroup>
    </div>
  );
}

/* ---------- 3. Rows unfold upright in 3D ---------- */
export function DonateItem({
  index,
  className = "",
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  const shown = inView || skip;
  const hidden = { opacity: 0, rotateX: -75, y: 28 };

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "50% 0%" }}
      initial={skip ? false : hidden}
      animate={shown ? { opacity: 1, rotateX: 0, y: 0 } : hidden}
      transition={
        skip
          ? instant
          : {
              ...UNFOLD,
              delay: ROW.start + index * ROW.stagger,
              opacity: { duration: 0.4, ease: "easeOut", delay: ROW.start + index * ROW.stagger },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/* ---------- 4. Heading flips in letter by letter ---------- */
/* Pass the text already cased: each letter is its own box, so an inherited
 * `text-transform: capitalize` would uppercase every letter. */
export function FlipText({ text }: { text: string }) {
  const { inView, skip } = useDonateMotion();
  const shown = inView || skip;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block" style={{ perspective: "600px" }}>
        {Array.from(text).map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block normal-case"
            style={{ transformOrigin: "50% 100%" }}
            initial={skip ? false : { opacity: 0, rotateX: -95, y: "30%" }}
            animate={shown ? { opacity: 1, rotateX: 0, y: "0%" } : { opacity: 0, rotateX: -95, y: "30%" }}
            transition={skip ? instant : { duration: 0.8, ease: EASE, delay: HEADING_DELAY + i * 0.04 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </>
  );
}

/* ---------- 5. Amounts roll in like an odometer ---------- */
export function RollingAmount({
  value,
  symbol,
  order,
  replay = false,
}: {
  /** Formatted amount including the currency symbol, e.g. "₹5,000". */
  value: string;
  symbol: string;
  /** Position among the preset buttons, for the stagger. */
  order: number;
  /** Rolling again after a currency change: start right away. */
  replay?: boolean;
}) {
  const { inView, skip } = useDonateMotion();
  const shown = inView || skip;
  // The symbol stays whole: splitting scripts like "د.إ" would break their shaping.
  const tokens = [symbol, ...Array.from(value.slice(symbol.length))];
  const base = replay ? order * 0.05 : AMOUNTS_DELAY + order * 0.08;

  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {tokens.map((token, i) => (
          <span key={`${token}-${i}`} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={skip ? false : { y: "110%" }}
              animate={{ y: shown ? "0%" : "110%" }}
              transition={skip ? instant : { duration: 0.6, ease: EASE, delay: base + i * 0.045 }}
            >
              {token}
            </motion.span>
          </span>
        ))}
      </span>
    </>
  );
}

/* ---------- Interaction: gold pill glides to the chosen amount ---------- */
export function AmountPill() {
  const { skip } = useDonateMotion();
  return (
    <motion.span
      aria-hidden="true"
      layoutId="donate-amount-pill"
      className="absolute inset-0 rounded bg-[#FCCC2D]"
      transition={skip ? instant : { type: "spring", stiffness: 520, damping: 38 }}
    />
  );
}

/* ---------- 4. Donate button: one sheen on arrival, glows when ready ---------- */
export function DonateCta({
  ready,
  className = "",
  children,
  ...props
}: {
  ready: boolean;
  className?: string;
  children: ReactNode;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "children"
>) {
  const { inView, live, skip } = useDonateMotion();
  const [arrived, setArrived] = useState(false);
  const glow = ready && inView && live && !skip;
  const introSheen = inView && !skip && !arrived;
  const sheenClass =
    "pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent";

  return (
    <motion.button
      {...props}
      className={`relative overflow-hidden ${className}`}
      whileHover={skip ? undefined : { y: -1 }}
      whileTap={skip ? undefined : { scale: 0.98 }}
      initial={false}
      animate={
        glow
          ? {
              boxShadow: [
                `0 0 0 0 rgba(${GOLD}, 0)`,
                `0 0 0 6px rgba(${GOLD}, 0.22)`,
                `0 0 0 0 rgba(${GOLD}, 0)`,
              ],
            }
          : { boxShadow: `0 0 0 0 rgba(${GOLD}, 0)` }
      }
      transition={
        glow ? { duration: 2.2, ease: "easeInOut", repeat: Infinity } : { duration: 0.3 }
      }
    >
      {introSheen ? (
        <motion.span
          aria-hidden="true"
          className={sheenClass}
          initial={{ x: "-120%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.1, ease: EASE_IN_OUT, delay: CTA_SHEEN_DELAY }}
          onAnimationComplete={() => setArrived(true)}
        />
      ) : null}
      {glow ? (
        <motion.span
          aria-hidden="true"
          className={sheenClass}
          initial={{ x: "-120%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.1, ease: EASE_IN_OUT, repeat: Infinity, repeatDelay: 1.8 }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </motion.button>
  );
}

/* Validation shake: give it a changing `key` to replay */
export function Shake({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { skip } = useDonateMotion();
  return (
    <motion.div
      className={className}
      initial={{ x: 0 }}
      animate={skip ? { x: 0 } : { x: [0, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/* Counts up from 0 as its row is revealed */
export function CountUp({
  to,
  delay = 1.5,
  duration = 1.6,
}: {
  to: number;
  delay?: number;
  duration?: number;
}) {
  const { inView, skip } = useDonateMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || skip) return;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, skip, to, delay, duration]);

  return <>{skip ? to : value}</>;
}
