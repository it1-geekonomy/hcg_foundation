"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";
import HcgLogoAnimation from "@/domains/home/components/hcgLogoAnimation";
import OverlayForm from "@/domains/home/components/OverlayForm";

const STATS = [
  {
    value: "50K+",
    label: "Patients Supported",
    story: "It began with one person who needed care.",
  },
  {
    value: "1,200+",
    label: "Screening Camps",
    story: "One village at a time, the circle widened.",
  },
  {
    value: "15+",
    label: "Years of Service",
    story: "Fifteen years later, we are still growing.",
  },
];

const T_SEED = 320;
const T_GROW = 680;
const T_SOLID = 480;
const T_HOLD = 100;
const T_EXIT = 200;
const STAT_MS = T_SEED + T_GROW + T_SOLID + T_HOLD + T_EXIT;

type Stage = "seed" | "grow" | "solid" | "hold" | "exit";
type Phase = number | "brand" | "lift";

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
const easeSmooth = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

type Particle = {
  sx: number;
  sy: number;
  mx: number;
  my: number;
  hx: number;
  hy: number;
  r: number;
  hue: number;
  d: number;
  fade: number;
};

function numeralFontSize(w: number, h: number) {
  return Math.min(w * 0.15, h * 0.34, 176);
}

function numeralFont(size: number) {
  let family = "ui-sans-serif, system-ui, sans-serif";

  if (typeof document !== "undefined") {
    const geist = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-sans")
      .trim();

    if (geist) {
      family = `${geist}, ui-sans-serif, system-ui, sans-serif`;
    }
  }

  return `700 ${size}px ${family}`;
}

function sampleText(
  text: string,
  w: number,
  h: number,
  step: number,
) {
  const c = document.createElement("canvas");

  c.width = w;
  c.height = h;

  const ctx = c.getContext("2d", {
    willReadFrequently: true,
  })!;

  const size = numeralFontSize(w, h);

  ctx.fillStyle = "#FFD43B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = numeralFont(size);

  ctx.fillText(
    text,
    w / 2,
    h / 2 - size * 0.3,
  );

  const data = ctx.getImageData(
    0,
    0,
    w,
    h,
  ).data;

  const pts: { x: number; y: number }[] = [];

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3]! > 140) {
        pts.push({
          x: x + (Math.random() - 0.5) * step,
          y: y + (Math.random() - 0.5) * step,
        });
      }
    }
  }

  return pts;
}

function drawSolidNumeral(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  h: number,
  alpha: number,
  scale = 1,
  blur = 0,
) {
  if (alpha <= 0.01) return;

  const size = numeralFontSize(w, h);
  const x = w / 2;
  const y = h / 2 - size * 0.3;

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-x, -y);

  ctx.globalAlpha = alpha;

  if (blur > 0.3) {
    ctx.filter = `blur(${blur}px)`;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = numeralFont(size);

  ctx.save();

  ctx.translate(
    size * 0.02,
    size * 0.03,
  );

  ctx.fillStyle = "rgba(40, 30, 0, 0.9)";
  ctx.fillText(text, x, y);

  ctx.restore();

  ctx.shadowColor = "rgba(255, 212, 59, 0.35)";
  ctx.shadowBlur = 24;

  ctx.fillStyle = "#FFD43B";
  ctx.fillText(text, x, y);

  ctx.restore();
}

function ParticleField({
  index,
  stage,
}: {
  index: number;
  stage: Stage;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stageRef = useRef<Stage>(stage);

  const startRef = useRef(
    typeof performance !== "undefined"
      ? performance.now()
      : 0,
  );

  if (stageRef.current !== stage) {
    stageRef.current = stage;
    startRef.current = performance.now();
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2,
    );

    let w = 0;
    let h = 0;

    let particles: Particle[] = [];

    let raf = 0;
    let cancelled = false;

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      const pts = sampleText(
        STATS[index]!.value,
        w,
        h,
        w < 640 ? 4 : 5,
      );

      const cx = w / 2;
      const cy = h / 2;

      particles = pts.map((p) => {
        const a =
          Math.random() * Math.PI * 2;

        const rad =
          Math.random() ** 2 * 14;

        const sx =
          cx + Math.cos(a) * rad;

        const sy =
          cy + Math.sin(a) * rad;

        const curl =
          (Math.random() - 0.5) *
          Math.min(w, h) *
          0.08;

        return {
          sx,
          sy,

          mx:
            (sx + p.x) * 0.5 +
            curl,

          my:
            (sy + p.y) * 0.5 -
            Math.abs(curl) * 0.35,

          hx: p.x,
          hy: p.y,

          r:
            Math.random() * 1.15 +
            0.85,

          hue:
            40 + Math.random() * 8,

          d:
            Math.random() * 0.28,

          fade:
            0.55 +
            Math.random() * 0.45,
        };
      });
    };

    const start = () => {
      if (cancelled) return;

      build();

      window.addEventListener(
        "resize",
        build,
      );

      raf = requestAnimationFrame(tick);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    const tick = () => {
      raf = requestAnimationFrame(tick);

      ctx.clearRect(
        0,
        0,
        w,
        h,
      );

      const st = stageRef.current;

      const t =
        performance.now() -
        startRef.current;

      const cx = w / 2;
      const cy = h / 2;

      const text = STATS[index]!.value;

      let progress = 0;
      let particleAlpha = 1;
      let solidAlpha = 0;
      let solidScale = 1;
      let solidBlur = 0;
      let merge = 0;
      let bloom = 0;

      if (st === "seed") {
        progress = 0;

        particleAlpha =
          easeSmooth(
            clamp01(t / T_SEED),
          );
      } else if (st === "grow") {
        progress =
          easeSmooth(
            clamp01(t / T_GROW),
          );
      } else if (st === "solid") {
        progress = 1;

        merge =
          easeSmooth(
            clamp01(t / T_SOLID),
          );

        particleAlpha = 1 - merge;
        solidAlpha = merge;

        solidScale =
          0.98 +
          solidAlpha * 0.02;

        solidBlur =
          (1 - merge) * 1.2;

        bloom =
          Math.sin(
            merge * Math.PI,
          ) * 0.28;
      } else if (st === "hold") {
        progress = 1;
        particleAlpha = 0;
        solidAlpha = 1;
        merge = 1;
      } else {
        progress = 1;
        particleAlpha = 0;
        merge = 1;

        const e =
          easeSmooth(
            clamp01(t / T_EXIT),
          );

        solidScale =
          1 + e * 1.8;

        solidBlur = e * 6;
        solidAlpha = 1 - e;
      }

      const pool =
        st === "seed"
          ? particleAlpha * 0.22
          : st === "grow"
            ? 0.18 +
              progress * 0.2
            : st === "solid"
              ? 0.3 +
                bloom * 0.25
              : solidAlpha * 0.35;

      if (pool > 0.02) {
        const g =
          ctx.createRadialGradient(
            cx,
            cy -
              numeralFontSize(
                w,
                h,
              ) *
                0.15,
            0,
            cx,
            cy,
            Math.min(w, h) *
              0.28,
          );

        g.addColorStop(
          0,
          `hsla(45, 90%, 60%, ${
            0.16 * pool
          })`,
        );

        g.addColorStop(
          0.55,
          `hsla(45, 80%, 45%, ${
            0.06 * pool
          })`,
        );

        g.addColorStop(
          1,
          "hsla(45, 80%, 40%, 0)",
        );

        ctx.fillStyle = g;

        ctx.fillRect(
          0,
          0,
          w,
          h,
        );
      }

      if (particleAlpha > 0.01) {
        for (const q of particles) {
          const u =
            easeSmooth(
              clamp01(
                (progress - q.d) /
                  (1 - q.d),
              ),
            );

          const omu = 1 - u;

          const x =
            omu * omu * q.sx +
            2 * omu * u * q.mx +
            u * u * q.hx;

          const y =
            omu * omu * q.sy +
            2 * omu * u * q.my +
            u * u * q.hy;

          const melt =
            st === "solid"
              ? merge
              : 0;

          const size =
            q.r *
            (0.9 + u * 0.15) *
            (1 + melt * 1.15);

          const a =
            particleAlpha *
            q.fade;

          if (a <= 0.01) continue;

          const light =
            64 + melt * 6;

          const sat =
            80 - melt * 6;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2,
          );

          ctx.fillStyle =
            `hsla(${q.hue}, ${sat}%, ${light}%, ${a})`;

          ctx.fill();
        }
      }

      drawSolidNumeral(
        ctx,
        text,
        w,
        h,
        solidAlpha,
        solidScale,
        solidBlur,
      );

      if (bloom > 0.04) {
        const br =
          Math.min(w, h) *
          0.22;

        const g =
          ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            br,
          );

        g.addColorStop(
          0,
          `hsla(45, 95%, 65%, ${
            0.14 * bloom
          })`,
        );

        g.addColorStop(
          0.5,
          `hsla(45, 90%, 50%, ${
            0.05 * bloom
          })`,
        );

        g.addColorStop(
          1,
          "hsla(45, 80%, 40%, 0)",
        );

        ctx.fillStyle = g;

        ctx.fillRect(
          cx - br,
          cy - br,
          br * 2,
          br * 2,
        );
      }

      const seedGlow =
        st === "seed"
          ? easeSmooth(
              clamp01(
                t / T_SEED,
              ),
            )
          : st === "grow"
            ? 1 -
              easeSmooth(
                clamp01(
                  t / 520,
                ),
              )
            : 0;

      if (seedGlow > 0.01) {
        const g =
          ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            100,
          );

        g.addColorStop(
          0,
          `hsla(45, 95%, 65%, ${
            0.38 * seedGlow
          })`,
        );

        g.addColorStop(
          0.4,
          `hsla(45, 90%, 50%, ${
            0.1 * seedGlow
          })`,
        );

        g.addColorStop(
          1,
          "hsla(45, 80%, 50%, 0)",
        );

        ctx.fillStyle = g;

        ctx.fillRect(
          cx - 100,
          cy - 100,
          200,
          200,
        );
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;

      cancelAnimationFrame(raf);

      window.removeEventListener(
        "resize",
        build,
      );
    };
  }, [index]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
    />
  );
}

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
                className={`h-px transition-all duration-500 ${
                  i <= activeIndex
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

export default function HomePage() {
  const [ready, setReady] =
    useState(false);

  const [showDonationOverlay, setShowDonationOverlay] =
    useState(true);

  return (
    <>
      {!ready && (
        <IntroSequence
          onDone={() =>
            setReady(true)
          }
        />
      )}

      {ready && (
        <>
          <ClientLayout>
            <ClientPage />
          </ClientLayout>

          {showDonationOverlay && (
            <OverlayForm
              onClose={() => setShowDonationOverlay(false)}
            />
          )}
        </>
      )}
    </>
  );
}