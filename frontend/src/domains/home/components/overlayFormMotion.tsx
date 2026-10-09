"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/*
 * Landing donation overlay: the card opens like a rolled scroll.
 *
 *   0.0s   the page behind softens; the card sits rolled up at its centre
 *   0.3s   the card unrolls outwards, up and down from the middle
 *   close  the card rolls back up to the centre, then fades
 *
 * Timed from mount (the overlay mounts when it opens); skipped under
 * prefers-reduced-motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const UNROLL_EASE = [0.45, 0, 0.2, 1] as const;

const ROLL = { delay: 0.3, duration: 1.15, closeDuration: 0.5 };
const RADIUS = "12px";
const CLIP_CLOSED = `inset(50% 0% 50% 0% round ${RADIUS})`;
const CLIP_OPEN = `inset(0% 0% 0% 0% round ${RADIUS})`;

const instant = { duration: 0 };
const useSkip = () => useReducedMotion() === true;

/* ---------- Backdrop ---------- */
/*
 * Safari fix: Framer Motion can't animate `backdrop-filter` in Safari (it only honours
 * `-webkit-backdrop-filter`, and Framer doesn't add that prefix), so the blur never showed
 * on Mac. The blur now lives on a separate STATIC layer (both prefixed and unprefixed) and
 * only that layer's opacity is animated, which every browser handles.
 */
const BLUR = "blur(4px)";

export function OverlayBackdrop({
  className = "",
  children,
  ...aria
}: {
  className?: string;
  children: ReactNode;
  role?: string;
  "aria-modal"?: boolean;
  "aria-labelledby"?: string;
}) {
  const skip = useSkip();
  const hidden = { backgroundColor: "rgba(255,255,255,0)" };
  const shown = { backgroundColor: "rgba(255,255,255,0.1)" };
  const closeExit = { duration: 0.35, ease: EASE, delay: ROLL.closeDuration };

  return (
    <motion.div
      {...aria}
      className={className}
      initial={skip ? shown : hidden}
      animate={shown}
      exit={{ ...hidden, transition: closeExit }}
      transition={skip ? instant : { duration: 0.5, ease: EASE }}
    >
      {/* Blur layer: sits behind the content (negative z-index stays inside this fixed,
          stacking-context parent), never intercepts clicks. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ WebkitBackdropFilter: BLUR, backdropFilter: BLUR }}
        initial={skip ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: closeExit }}
        transition={skip ? instant : { duration: 0.5, ease: EASE }}
      />
      {children}
    </motion.div>
  );
}

/* ---------- Card that unrolls from its centre ---------- */
export function CardReveal({
  frameClassName = "",
  className = "",
  children,
}: {
  /** Sizing and placement of the card. */
  frameClassName?: string;
  /** The card surface itself. */
  className?: string;
  children: ReactNode;
}) {
  const skip = useSkip();
  return (
    <motion.div
      className={`relative flex flex-col ${frameClassName}`}
      exit={
        skip
          ? { opacity: 0, transition: instant }
          : { opacity: 0, transition: { duration: 0.25, ease: EASE, delay: ROLL.closeDuration } }
      }
    >
      <motion.div
        className={`min-h-0 ${className}`}
        initial={skip ? false : { clipPath: CLIP_CLOSED }}
        animate={{
          clipPath: CLIP_OPEN,
          // A lingering clip would cut off the country dropdown.
          transitionEnd: { clipPath: "none" },
        }}
        exit={
          skip
            ? undefined
            : {
                clipPath: [CLIP_OPEN, CLIP_CLOSED],
                transition: { duration: ROLL.closeDuration, ease: UNROLL_EASE },
              }
        }
        transition={skip ? instant : { duration: ROLL.duration, ease: UNROLL_EASE, delay: ROLL.delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* Dark pill that glides to the chosen amount (scope with a LayoutGroup per layout). */
export function ActivePill() {
  const skip = useSkip();
  return (
    <motion.span
      aria-hidden="true"
      layoutId="overlay-amount-pill"
      className="absolute inset-0 rounded-full bg-[#1C1C1C]"
      transition={skip ? instant : { type: "spring", stiffness: 520, damping: 38 }}
    />
  );
}