"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Variants: the card sets "hover", children follow ---------- */
const backSheet: Variants = {
  rest: { rotate: 0, x: 0 },
  hover: { rotate: -7, x: -3, transition: { duration: 0.45, ease: EASE } },
};

const midSheet: Variants = {
  rest: { rotate: 0, x: 0 },
  hover: {
    rotate: 6,
    x: 3,
    transition: { duration: 0.45, ease: EASE, delay: 0.04 },
  },
};

const fold: Variants = {
  rest: { scale: 0 },
  hover: { scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const icon: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -1, scale: 1.06, transition: { duration: 0.45, ease: EASE } },
};

/* ---------- Card wrapper: hover / keyboard focus triggers the children ---------- */
export function ReportCardShell({
  onOpen,
  children,
}: {
  onOpen: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : "hover"}
      whileFocus={reduce ? undefined : "hover"}
      className="ar-card relative flex cursor-pointer items-stretch gap-3 rounded-2xl bg-[#FFFCF3] p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCCC2D]"
    >
      {children}
    </motion.div>
  );
}

/* ---------- PDF tile: two sheets slide out, corner folds, icon lifts ---------- */
export function PdfTile() {
  return (
    <div className="relative w-12 sm:w-14 lg:w-16 shrink-0 self-stretch">
      <motion.span
        aria-hidden="true"
        variants={backSheet}
        style={{ transformOrigin: "50% 100%", willChange: "transform" }}
        className="absolute inset-0 rounded-lg border border-[#E5B400]/35 bg-[#FFF1BA]"
      />
      <motion.span
        aria-hidden="true"
        variants={midSheet}
        style={{ transformOrigin: "50% 100%", willChange: "transform" }}
        className="absolute inset-0 rounded-lg border border-[#E5B400]/35 bg-[#FFF9E0]"
      />

      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[#FFEBAF]">
        {/* Folded corner: fixed 14px triangle that scales in from the top-right */}
        <motion.span
          aria-hidden="true"
          variants={fold}
          style={{
            transformOrigin: "100% 0%",
            background: "linear-gradient(225deg, #FFFCF3 50%, #E5B400 50%)",
          }}
          className="absolute right-0 top-0 h-[14px] w-[14px]"
        />

        <motion.img
          variants={icon}
          src="/pdficon.png"
          alt="PDF"
          className="h-10 w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10"
        />
      </div>
    </div>
  );
}

/* ---------- Download progress: yellow line fills the bottom edge ---------- */
export function DownloadProgress({ progress }: { progress: number }) {
  const done = progress >= 100;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
    >
      <motion.span
        className="absolute bottom-0 left-0 h-1 rounded-r bg-[#FCCC2D]"
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: `${progress}%`, opacity: done ? 0 : 1 }}
        transition={{
          width: { duration: 0.2, ease: "easeOut" },
          opacity: { duration: 0.5, delay: 0.15 },
        }}
      />
    </div>
  );
}