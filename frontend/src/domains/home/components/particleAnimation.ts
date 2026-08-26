import { type Stage } from "../constants/footer";
import { easeSmooth, clamp01, numeralFontSize } from "./utils";
import { T_SEED, T_GROW, T_SOLID, T_EXIT } from "../constants/footer";

export interface AnimationState {
  progress: number;
  particleAlpha: number;
  solidAlpha: number;
  solidScale: number;
  solidBlur: number;
  merge: number;
  bloom: number;
}

export function getAnimationState(stage: Stage, time: number): AnimationState {
  const state: AnimationState = {
    progress: 0,
    particleAlpha: 1,
    solidAlpha: 0,
    solidScale: 1,
    solidBlur: 0,
    merge: 0,
    bloom: 0,
  };

  if (stage === "seed") {
    state.progress = 0;
    state.particleAlpha = easeSmooth(clamp01(time / T_SEED));
  } else if (stage === "grow") {
    state.progress = easeSmooth(clamp01(time / T_GROW));
  } else if (stage === "solid") {
    state.progress = 1;
    state.merge = easeSmooth(clamp01(time / T_SOLID));
    state.particleAlpha = 1 - state.merge;
    state.solidAlpha = state.merge;
    state.solidScale = 0.98 + state.solidAlpha * 0.02;
    state.solidBlur = (1 - state.merge) * 1.2;
    state.bloom = Math.sin(state.merge * Math.PI) * 0.28;
  } else if (stage === "hold") {
    state.progress = 1;
    state.particleAlpha = 0;
    state.solidAlpha = 1;
    state.merge = 1;
  } else {
    state.progress = 1;
    state.particleAlpha = 0;
    state.merge = 1;
    const e = easeSmooth(clamp01(time / T_EXIT));
    state.solidScale = 1 + e * 1.8;
    state.solidBlur = e * 6;
    state.solidAlpha = 1 - e;
  }

  return state;
}

export function getPoolIntensity(stage: Stage, state: AnimationState): number {
  if (stage === "seed") return state.particleAlpha * 0.22;
  if (stage === "grow") return 0.18 + state.progress * 0.2;
  if (stage === "solid") return 0.3 + state.bloom * 0.25;
  return state.solidAlpha * 0.35;
}

export function getSeedGlow(stage: Stage, time: number): number {
  if (stage === "seed") {
    return easeSmooth(clamp01(time / T_SEED));
  }
  if (stage === "grow") {
    return 1 - easeSmooth(clamp01(time / 520));
  }
  return 0;
}

export function drawRadialGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  stops: { offset: number; color: string }[],
  radius: number,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
  ctx.fillStyle = gradient;
  
  if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
    ctx.fillRect(x, y, width, height);
  } else {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

export function drawPoolGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  pool: number,
) {
  if (pool <= 0.02) return;
  
  const fontSize = numeralFontSize(w, h);
  const stops = [
    { offset: 0, color: `hsla(45, 90%, 60%, ${0.16 * pool})` },
    { offset: 0.55, color: `hsla(45, 80%, 45%, ${0.06 * pool})` },
    { offset: 1, color: "hsla(45, 80%, 40%, 0)" },
  ];
  
  drawRadialGradient(
    ctx,
    cx,
    cy - fontSize * 0.15,
    stops,
    Math.min(w, h) * 0.28,
  );
}

export function drawBloomGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  bloom: number,
) {
  if (bloom <= 0.04) return;
  
  const br = Math.min(w, h) * 0.22;
  const stops = [
    { offset: 0, color: `hsla(45, 95%, 65%, ${0.14 * bloom})` },
    { offset: 0.5, color: `hsla(45, 90%, 50%, ${0.05 * bloom})` },
    { offset: 1, color: "hsla(45, 80%, 40%, 0)" },
  ];
  
  drawRadialGradient(
    ctx,
    cx,
    cy,
    stops,
    br,
    cx - br,
    cy - br,
    br * 2,
    br * 2,
  );
}

export function drawSeedGlowGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  seedGlow: number,
) {
  if (seedGlow <= 0.01) return;
  
  const stops = [
    { offset: 0, color: `hsla(45, 95%, 65%, ${0.38 * seedGlow})` },
    { offset: 0.4, color: `hsla(45, 90%, 50%, ${0.1 * seedGlow})` },
    { offset: 1, color: "hsla(45, 80%, 50%, 0)" },
  ];
  
  drawRadialGradient(
    ctx,
    cx,
    cy,
    stops,
    100,
    cx - 100,
    cy - 100,
    200,
    200,
  );
}
