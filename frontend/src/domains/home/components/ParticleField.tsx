"use client";

import { useEffect, useRef } from "react";

import { STATS, T_SEED, T_GROW, T_SOLID, T_EXIT, T_HOLD, type Stage, type Particle } from "./constants";
import {
  easeSmooth,
  clamp01,
  sampleText,
  drawSolidNumeral,
  numeralFontSize,
} from "./utils";

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

export default ParticleField;
