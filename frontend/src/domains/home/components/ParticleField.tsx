"use client";

import { useEffect, useRef } from "react";

import { STATS, type Stage, type Particle } from "../constants/footer";
import { sampleText, drawSolidNumeral } from "./utils";
import {
  getAnimationState,
  getPoolIntensity,
  getSeedGlow,
  drawPoolGradient,
  drawBloomGradient,
  drawSeedGlowGradient,
} from "./particleAnimation";
import { renderParticles, createParticles } from "./particleRenderer";

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

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pts = sampleText(
        STATS[index]!.value,
        w,
        h,
        w < 640 ? 4 : 5,
      );

      particles = createParticles(pts, w, h);
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

      ctx.clearRect(0, 0, w, h);

      const st = stageRef.current;
      const t = performance.now() - startRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const text = STATS[index]!.value;

      const state = getAnimationState(st, t);
      const pool = getPoolIntensity(st, state);

      drawPoolGradient(ctx, cx, cy, w, h, pool);

      renderParticles(
        ctx,
        particles,
        state.progress,
        state.particleAlpha,
        st,
        state.merge,
      );

      drawSolidNumeral(
        ctx,
        text,
        w,
        h,
        state.solidAlpha,
        state.solidScale,
        state.solidBlur,
      );

      drawBloomGradient(ctx, cx, cy, w, h, state.bloom);

      const seedGlow = getSeedGlow(st, t);
      drawSeedGlowGradient(ctx, cx, cy, seedGlow);
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
