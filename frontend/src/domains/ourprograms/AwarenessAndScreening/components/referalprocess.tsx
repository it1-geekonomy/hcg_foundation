"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Typography from "@/lib/Typography";
import { REFERRAL_PROCESS_ITEMS } from "@/domains/ourprograms/AwarenessAndScreening/constants/referalprocess";
// Reuses the same once-only viewport hook as HowToRefer.
// Adjust this path to wherever howToReferAnimation.ts lives in your project.
import { useSectionVisible } from "@/domains/ourprograms/FinancialSupport/components/howToReferAnimation";

/* ---------- Timing ---------- */
const START_OFFSET = 0.2; // wait after the section enters
const STAGGER = 0.3; // gap between one icon and the next
const POP_DURATION = 0.6;
const RING_DURATION = 0.9;
const RING_LAG = 0.1; // ring starts slightly after the pop begins
const RING_REPEAT_DELAY = 0.8; // pause between each ring pulse

function CheckIcon({ index, play }: { index: number; play: boolean }) {
  const reduce = useReducedMotion();
  const delay = START_OFFSET + index * STAGGER;
  const animate = play && !reduce;

  return (
    <span aria-hidden className="relative mt-0.5 h-5 w-5 shrink-0">
      {/* Ripple ring: loops forever */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#FCCC2D]"
        style={{ willChange: "transform, opacity" }}
        initial={{ scale: 1, opacity: 0 }}
        animate={
          animate
            ? { scale: [1, 2.6], opacity: [0.7, 0] }
            : { scale: 1, opacity: 0 }
        }
        transition={{
          duration: RING_DURATION,
          ease: "easeOut",
          delay: delay + RING_LAG, // applies only before the first cycle
          repeat: animate ? Infinity : 0,
          repeatType: "loop",
          repeatDelay: RING_REPEAT_DELAY,
        }}
      />

      {/* Circle + tick: always visible, pops once */}
      <motion.span
        className="flex h-full w-full items-center justify-center rounded-full bg-[#FCCC2D]"
        style={{ willChange: "transform" }}
        initial={{ scale: 1 }}
        animate={animate ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{
          duration: POP_DURATION,
          times: [0, 0.45, 1],
          ease: ["easeOut", [0.34, 1.56, 0.64, 1]],
          delay,
        }}
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </motion.span>
    </span>
  );
}

export default function ReferralProcess() {
  const { ref: sectionRef, visible } = useSectionVisible<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-x-hidden bg-[#FFF8E2] pt-0 pb-8 px-8 sm:px-12 md:px-16 lg:py-12 lg:px-6 xl:px-6 2xl:px-40"
    >
      {/* Heading: static */}
      <Typography
        variant="heading-7"
        as="h2"
        className="font-tiempos-headline text-[#382E07] font-normal"
      >
        The process to refer a patient to HCG Foundation
      </Typography>

      <ul className="mt-8 space-y-5">
        {REFERRAL_PROCESS_ITEMS.map((text, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckIcon index={index} play={visible} />

            {/* Text: static */}
            <Typography
              variant="body-2"
              as="p"
              className="font-normal font-argestadisplay text-[#293239]"
            >
              {text}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
}