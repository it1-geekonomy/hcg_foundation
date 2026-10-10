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
    typeof performance !== "undefined" ? performance.now() : 0,
  );

  if (stageRef.current !== stage) {
    stageRef.current = stage;
    startRef.current = performance.now();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const text = STATS[index]!.value;

    let w = 0;
    let h = 0;
    let lastW = 0;
    let lastH = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let resizeTimer = 0;
    let cancelled = false;
    let built = false;
    // True once a frame that will not change any more (hold / fully faded exit) has been drawn.
    let staticDone = false;

    const build = (): boolean => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return false;

      // Phones: 1.5x is visually the same for tiny dots and ~45% fewer pixels to clear/fill each frame.
      dpr = Math.min(window.devicePixelRatio || 1, w < 640 ? 1.5 : 2);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = createParticles(sampleText(text, w, h, w < 640 ? 4 : 5), w, h);

      lastW = w;
      lastH = h;
      staticDone = false;
      built = true;
      return true;
    };

    // ONE loop only. (Before, the effect started a loop AND start() started a second one; cancelAnimationFrame
    // only cancelled the latest id, so the other loop kept running forever after the scene was gone —
    // every stat left another full-screen render loop running in the background.)
    const tick = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);

      if (!built && !build()) return;

      const st = stageRef.current;
      const t = performance.now() - startRef.current;
      const state = getAnimationState(st, t);

      // Skip frames that would be pixel-identical (the "hold" pause and the fully faded end of "exit").
      const isStatic = st === "hold" || (st === "exit" && state.solidAlpha <= 0.001);
      if (isStatic && staticDone) return;
      staticDone = isStatic;

      const cx = w / 2;
      const cy = h / 2;
      const pool = getPoolIntensity(st, state);

      ctx.clearRect(0, 0, w, h);

      drawPoolGradient(ctx, cx, cy, w, h, pool);

      renderParticles(
        ctx,
        particles,
        state.progress,
        state.particleAlpha,
        st,
        state.merge,
      );

      if (state.solidAlpha > 0.001) {
        drawSolidNumeral(
          ctx,
          text,
          w,
          h,
          state.solidAlpha,
          state.solidScale,
          state.solidBlur,
        );
      }

      drawBloomGradient(ctx, cx, cy, w, h, state.bloom);

      drawSeedGlowGradient(ctx, cx, cy, getSeedGlow(st, t));
    };

    // Only rebuild when the size really changed, and not on every event (phone toolbars fire many
    // resize events; each rebuild re-samples the text and re-randomises every particle = visible flicker).
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (Math.abs(canvas.clientWidth - lastW) < 2 && Math.abs(canvas.clientHeight - lastH) < 2) {
          return;
        }
        build();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const start = () => {
      if (cancelled) return;
      build();
      raf = requestAnimationFrame(tick);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
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