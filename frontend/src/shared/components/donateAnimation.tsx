"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

/* ---------- Shared state: has the section entered the viewport? ---------- */
const DonateMotionContext = createContext({ inView: false, skip: false });
const useDonateMotion = () => useContext(DonateMotionContext);

/* Watches the section once; plays once, never replays */
export function useSectionInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

/* Wrap everything that animates inside the section with this */
export function DonateMotionProvider({
  inView,
  children,
}: {
  inView: boolean;
  children: ReactNode;
}) {
  const skip = useReducedMotion() === true;
  return (
    <DonateMotionContext.Provider value={{ inView, skip }}>
      {children}
    </DonateMotionContext.Provider>
  );
}

/* 1. Photo settles in: starts slightly zoomed, eases to normal */
export function DonateBg({ children }: { children: ReactNode }) {
  const { inView, skip } = useDonateMotion();
  return (
    <motion.div
      className="absolute inset-0"
      style={{ willChange: "transform" }}
      initial={skip ? false : { scale: 1.14 }}
      animate={{ scale: inView || skip ? 1 : 1.14 }}
      transition={skip ? { duration: 0 } : { duration: 2.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* 2. Card glides in (from below on mobile, from the right on desktop) */
export function DonateCard({
  from,
  className,
  style,
  children,
}: {
  from: "bottom" | "right";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  const hidden =
    from === "bottom" ? { opacity: 0, y: 50 } : { opacity: 0, x: 90 };

  return (
    <motion.div
      className={className}
      style={style}
      initial={skip ? false : hidden}
      animate={inView || skip ? { opacity: 1, x: 0, y: 0 } : hidden}
      transition={skip ? { duration: 0 } : { duration: 1.1, ease: EASE, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/* 3. Heading word rises out of a mask */
export function MaskWord({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  return (
    <span className="inline-block overflow-hidden align-top">
      <motion.span
        className="inline-block"
        initial={skip ? false : { y: "115%" }}
        animate={{ y: inView || skip ? "0%" : "115%" }}
        transition={
          skip ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: 1 + index * 0.13 }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}

/* 4. Every block fades up in order */
export function DonateItem({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  return (
    <motion.div
      className={className}
      initial={skip ? false : { opacity: 0, y: 22 }}
      animate={inView || skip ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={
        skip ? { duration: 0 } : { duration: 0.8, ease: EASE, delay: 1.2 + index * 0.11 }
      }
    >
      {children}
    </motion.div>
  );
}

/* 5. Divider line draws outward from the centre */
export function DrawLine({ side }: { side: "left" | "right" }) {
  const { inView, skip } = useDonateMotion();
  return (
    <motion.span
      className="h-px flex-1 bg-white/25"
      style={{ transformOrigin: side === "left" ? "right" : "left" }}
      initial={skip ? false : { scaleX: 0 }}
      animate={{ scaleX: inView || skip ? 1 : 0 }}
      transition={
        skip ? { duration: 0 } : { duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 1.9 }
      }
    />
  );
}

/* 6. Avatar pops in */
export function AvatarPop({
  index,
  zIndex,
  children,
}: {
  index: number;
  zIndex: number;
  children: ReactNode;
}) {
  const { inView, skip } = useDonateMotion();
  return (
    <motion.span
      className="relative flex"
      style={{ zIndex }}
      initial={skip ? false : { opacity: 0, scale: 0.4 }}
      animate={inView || skip ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
      transition={
        skip ? { duration: 0 } : { duration: 0.5, ease: POP, delay: 2.3 + index * 0.11 }
      }
    >
      {children}
    </motion.span>
  );
}

/* ---------- Shared heartbeat: lub-dub, then a rest, on a loop ---------- */
function Beat({
  children,
  className,
  peak,
  second,
  startDelay,
  origin = "center",
}: {
  children: ReactNode;
  className?: string;
  peak: number; // first (big) beat
  second: number; // second (smaller) beat
  startDelay: number; // seconds before the loop starts
  origin?: string;
}) {
  const { inView, skip } = useDonateMotion();
  const play = inView && !skip;

  return (
    <motion.span
      className={className}
      style={{
        transformOrigin: origin,
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      initial={false}
      animate={play ? { scale: [1, peak, 1, second, 1] } : { scale: 1 }}
      transition={
        play
          ? {
              duration: 0.6, // the "lub-dub" itself
              times: [0, 0.22, 0.45, 0.68, 1],
              // fast rise, soft fall, so it never stalls at the peak
              ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 0.8, // the rest between beats
              delay: startDelay, // only applies before the first beat
            }
          : { duration: 0.2 }
      }
    >
      {children}
    </motion.span>
  );
}

/* 7. Heart emoji beat */
export function HeartBeat({ children }: { children: ReactNode }) {
  return (
    <Beat className="inline-block" peak={1.3} second={1.18} startDelay={3}>
      {children}
    </Beat>
  );
}

/* 8. Heading icon beats like a heart (lub-dub) */
export function IconBeat({ children }: { children: ReactNode }) {
  return (
    <Beat className="flex" peak={1.22} second={1.16} startDelay={1.6}>
      {children}
    </Beat>
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

/* Counts up from 0 as the content appears */
export function CountUp({
  to,
  delay = 2.2,
  duration = 1.8,
}: {
  to: number;
  delay?: number;
  duration?: number;
}) {
  const { inView, skip } = useDonateMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (skip) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.33, 1, 0.68, 1], // ease-out cubic
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, skip, to, delay, duration]);

  return <>{value}</>;
}