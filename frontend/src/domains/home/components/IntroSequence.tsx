"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import HcgLogoAnimation, { preloadHcgLogo } from "./hcgLogoAnimation";
import ParticleField from "./ParticleField";
import {
  STATS,
  T_SEED,
  T_GROW,
  T_SOLID,
  T_HOLD,
  STAT_MS,
  type Stage,
  type Phase,
} from "../constants/footer";

const EASE = [0.33, 1, 0.32, 1] as const;

/**
 * One stat. It owns its own stage/copy timers and starts them when IT mounts, so the timers are always
 * in sync with the particle field. Before, the timers lived in the parent and started at the phase change,
 * but AnimatePresence mode="wait" mounted the new field ~400ms later — the field then started mid-animation
 * (particles popping in) and the stage was briefly reset to "seed" while the old one was still on screen.
 */
function StatScene({ index, onNext }: { index: number; onNext: () => void }) {
  const [stage, setStage] = useState<Stage>("seed");
  const [showCopy, setShowCopy] = useState(false);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setStage("grow");
        setShowCopy(true);
      }, T_SEED),
      setTimeout(() => setStage("solid"), T_SEED + T_GROW),
      setTimeout(() => setStage("hold"), T_SEED + T_GROW + T_SOLID),
      setTimeout(() => {
        setStage("exit");
        setShowCopy(false);
      }, T_SEED + T_GROW + T_SOLID + T_HOLD),
      setTimeout(() => onNextRef.current(), STAT_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const stat = STATS[index];

  return (
    <>
      <ParticleField index={index} stage={stage} />

      <div className="absolute inset-x-0 top-[56%] flex justify-center px-6 sm:top-[58%]">
        <div className="w-full max-w-2xl text-center">
          <AnimatePresence mode="wait">
            {stat && showCopy && (
              <motion.div
                key={`stat-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <p className="text-lg leading-snug text-white/75 sm:text-2xl">{stat.story}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export function IntroSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);
  const doneRef = useRef(false);

  const finishOnce = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  // Start loading + decoding the logo images now (during the stats), so the brand scene starts instantly.
  useEffect(() => {
    preloadHcgLogo();
  }, []);

  // The intro covers the page, but the page underneath was still scrollable (and the hero reacts to
  // scroll), which caused jumps behind/after the intro. Block user scrolling while it is up.
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const stopKeys = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("button")) return; // keep Skip usable by keyboard
      if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", stop, { passive: false, capture: true });
    window.addEventListener("touchmove", stop, { passive: false, capture: true });
    window.addEventListener("keydown", stopKeys, { capture: true });
    return () => {
      window.removeEventListener("wheel", stop, { capture: true });
      window.removeEventListener("touchmove", stop, { capture: true });
      window.removeEventListener("keydown", stopKeys, { capture: true });
    };
  }, []);

  // If the fade-out animation never reports completion (hidden tab etc.), still finish.
  useEffect(() => {
    if (phase !== "lift") return;
    const t = setTimeout(finishOnce, 900);
    return () => clearTimeout(t);
  }, [phase, finishOnce]);

  const goNext = useCallback(() => {
    setPhase((prev) =>
      typeof prev === "number" ? (prev + 1 < STATS.length ? prev + 1 : "brand") : prev,
    );
  }, []);

  const activeIndex = typeof phase === "number" ? phase : STATS.length;
  const showStatsUi = typeof phase === "number";

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-[#2D2D2D]"
      initial={{ opacity: 1 }}
      animate={phase === "lift" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      onAnimationComplete={() => phase === "lift" && finishOnce()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_25%,#2D2D2D_85%)]" />

      {/* Crossfade (no mode="wait"): the next scene mounts immediately, in sync with its own timers.
          initial={false}: the very first scene shows at once, like before. */}
      <AnimatePresence initial={false}>
        {typeof phase === "number" && (
          <motion.div
            key={`scene-${phase}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <StatScene index={phase} onNext={goNext} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "brand" && (
          <motion.div
            key="brand"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <HcgLogoAnimation embedded onDone={() => setPhase("lift")} />
          </motion.div>
        )}
      </AnimatePresence>

      {showStatsUi && (
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {STATS.map((s, i) => (
            <span
              key={s.value}
              className={`h-px transition-all duration-500 ${
                i <= activeIndex ? "w-10 bg-[#FFD43B]/80" : "w-5 bg-white/15"
              }`}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setPhase("lift")}
        className="absolute right-6 top-6 z-10 rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/75"
      >
        Skip
      </button>
    </motion.div>
  );
}

export default IntroSequence;