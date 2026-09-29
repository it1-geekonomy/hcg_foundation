"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

/* ---------- Timing: rings fire one after another, then pause, then repeat ---------- */
const RING_DURATION = 1.0; // seconds one ring takes
const STEP = 1.0; // gap between one icon's ring and the next (= duration -> strictly sequential)
const PAUSE = 0.8; // rest after the last icon before the loop restarts

const spring = { type: "spring", stiffness: 300, damping: 14 } as const;

const iconVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: -8, transition: spring },
};

const imgVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.12, transition: spring },
};

/* Row wrapper: hovering anywhere on the row triggers the icon's "hover" variant */
export function ContactRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="rest"
      animate="rest"
      whileHover={reduce ? "rest" : "hover"}
    >
      {children}
    </motion.div>
  );
}

/* Yellow circle + sequential ping ring (ring is a sibling, so hover never affects it) */
export function ContactIcon({
  src,
  alt,
  index,
  total,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
}) {
  const reduce = useReducedMotion();

  // One full loop = every icon's turn + a pause
  const cycle = total * STEP + PAUSE;

  return (
    <div className="relative size-10 sm:size-12 lg:size-13 shrink-0">
      {/* Ping ring: always mounted, transform + opacity only */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[#FCCC2D]"
        style={{ willChange: "transform, opacity" }}
        initial={{ scale: 1, opacity: 0 }}
        animate={
          reduce
            ? { scale: 1, opacity: 0 }
            : { scale: [1, 1.8], opacity: [0.55, 0] }
        }
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: RING_DURATION,
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "loop",
                delay: index * STEP,
                repeatDelay: cycle - RING_DURATION,
              }
        }
      />

      {/* Icon circle: hover wiggle only */}
      <motion.div
        variants={iconVariants}
        className="relative flex size-full items-center justify-center rounded-full bg-[#FCCC2D]"
      >
        <motion.img
          variants={imgVariants}
          src={src}
          alt={alt}
          className="size-4 sm:size-5 lg:size-6"
        />
      </motion.div>
    </div>
  );
}