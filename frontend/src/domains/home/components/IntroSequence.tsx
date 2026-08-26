"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import HcgLogoAnimation from "./hcgLogoAnimation";
import ParticleField from "./ParticleField";
import { STATS, T_SEED, T_GROW, T_SOLID, T_HOLD, STAT_MS, type Stage, type Phase } from "../constants/footer";

export function IntroSequence({
  onDone,
}: {
  onDone: () => void;
}) {
  const [phase, setPhase] =
    useState<Phase>(0);

  const [stage, setStage] =
    useState<Stage>("seed");

  const [showCopy, setShowCopy] =
    useState(false);

  useEffect(() => {
    if (
      typeof phase !== "number"
    ) {
      setShowCopy(false);
      return;
    }

    setStage("seed");
    setShowCopy(false);

    const timers = [
      setTimeout(
        () => setStage("grow"),
        T_SEED,
      ),

      setTimeout(
        () => setShowCopy(true),
        T_SEED,
      ),

      setTimeout(
        () => setStage("solid"),
        T_SEED + T_GROW,
      ),

      setTimeout(
        () => setStage("hold"),
        T_SEED +
        T_GROW +
        T_SOLID,
      ),

      setTimeout(
        () => {
          setStage("exit");
          setShowCopy(false);
        },
        T_SEED +
        T_GROW +
        T_SOLID +
        T_HOLD,
      ),
    ];

    return () =>
      timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (
      phase === "lift" ||
      phase === "brand"
    ) {
      return;
    }

    const timer = setTimeout(
      () => {
        setPhase((prev) =>
          typeof prev === "number"
            ? prev + 1 <
              STATS.length
              ? prev + 1
              : "brand"
            : prev,
        );
      },
      STAT_MS,
    );

    return () =>
      clearTimeout(timer);
  }, [phase]);

  const stat =
    typeof phase === "number"
      ? STATS[phase]!
      : null;

  const showType =
    stat !== null &&
    showCopy;

  const activeIndex =
    typeof phase === "number"
      ? phase
      : STATS.length;

  const showStatsUi =
    typeof phase === "number";

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-[#2D2D2D]"
      initial={{ opacity: 1 }}
      animate={
        phase === "lift"
          ? { opacity: 0 }
          : { opacity: 1 }
      }
      transition={{
        duration: 0.55,
        ease: [
          0.33,
          1,
          0.32,
          1,
        ],
      }}
      onAnimationComplete={() =>
        phase === "lift" &&
        onDone()
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_25%,#2D2D2D_85%)]" />

      <AnimatePresence mode="wait">
        {showStatsUi && (
          <motion.div
            key={`stat-field-${phase}`}
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [
                0.33,
                1,
                0.32,
                1,
              ],
            }}
          >
            <ParticleField
              index={phase as number}
              stage={stage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "brand" && (
          <motion.div
            key="brand"
            className="absolute inset-0"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.45,
              ease: [
                0.33,
                1,
                0.32,
                1,
              ],
            }}
          >
            <HcgLogoAnimation
              embedded
              onDone={() =>
                setPhase("lift")
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showStatsUi && (
        <>
          <div className="absolute inset-x-0 top-[56%] flex justify-center px-6 sm:top-[58%]">
            <div className="w-full max-w-2xl text-center">
              <AnimatePresence mode="wait">
                {stat &&
                  showType && (
                    <motion.div
                      key={`stat-${phase}`}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: [
                          0.33,
                          1,
                          0.32,
                          1,
                        ],
                      }}
                    >
                      <p className="text-sm font-medium uppercase tracking-[0.4em] text-[#FFD43B] sm:text-base">
                        {stat.label}
                      </p>

                      <p className="mt-2.5 text-lg leading-snug text-white/75 sm:mt-3 sm:text-2xl">
                        {stat.story}
                      </p>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {STATS.map((s, i) => (
              <span
                key={s.value}
                className={`h-px transition-all duration-500 ${i <= activeIndex
                  ? "w-10 bg-[#FFD43B]/80"
                  : "w-5 bg-white/15"
                  }`}
              />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() =>
          setPhase("lift")
        }
        className="absolute right-6 top-6 z-10 rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/75"
      >
        Skip
      </button>
    </motion.div>
  );
}

export default IntroSequence;
