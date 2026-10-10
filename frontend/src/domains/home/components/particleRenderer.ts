import { type Particle } from "../constants/footer";
import { easeSmooth, clamp01 } from "./utils";

/**
 * PERF: the old version called beginPath/arc/fill and built a new hsla() string for EVERY particle EVERY
 * frame (thousands of allocations + fills per frame). Particles are now grouped into a few alpha levels and
 * each level is drawn as ONE path with ONE fill. Same look, a fraction of the work.
 *
 * Differences (barely visible): hue is one value (the particles only varied 40–48), and dots of the
 * same level that overlap no longer stack their alpha.
 */
const ALPHA_LEVELS = 12;
const HUE = 44;
const TAU = Math.PI * 2;

// Reused every frame — no per-frame allocation.
let xs = new Float32Array(0);
let ys = new Float32Array(0);
let rs = new Float32Array(0);
let levels = new Uint8Array(0);
const counts = new Int32Array(ALPHA_LEVELS);

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  progress: number,
  particleAlpha: number,
  stage: string,
  merge: number,
) {
  if (particleAlpha <= 0.01) return;

  const n = particles.length;
  if (xs.length < n) {
    xs = new Float32Array(n);
    ys = new Float32Array(n);
    rs = new Float32Array(n);
    levels = new Uint8Array(n);
  }
  counts.fill(0);

  const melt = stage === "solid" ? merge : 0;
  const sizeMul = 1 + melt * 1.15;
  const light = 64 + melt * 6;
  const sat = 80 - melt * 6;

  for (let i = 0; i < n; i++) {
    const q = particles[i]!;
    const a = particleAlpha * q.fade;
    if (a <= 0.01) {
      levels[i] = 0;
      continue;
    }

    const u = easeSmooth(clamp01((progress - q.d) / (1 - q.d)));
    const omu = 1 - u;
    xs[i] = omu * omu * q.sx + 2 * omu * u * q.mx + u * u * q.hx;
    ys[i] = omu * omu * q.sy + 2 * omu * u * q.my + u * u * q.hy;
    rs[i] = q.r * (0.9 + u * 0.15) * sizeMul;

    const level = Math.min(ALPHA_LEVELS, Math.max(1, Math.ceil(a * ALPHA_LEVELS)));
    levels[i] = level;
    counts[level - 1]!++;
  }

  for (let level = 1; level <= ALPHA_LEVELS; level++) {
    if (counts[level - 1] === 0) continue;

    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      if (levels[i] !== level) continue;
      const x = xs[i]!;
      const y = ys[i]!;
      const r = rs[i]!;
      ctx.moveTo(x + r, y); // start each dot separately so no connecting lines are drawn
      ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fillStyle = `hsla(${HUE}, ${sat}%, ${light}%, ${(level - 0.5) / ALPHA_LEVELS})`;
    ctx.fill();
  }
}

export function createParticles(
  points: { x: number; y: number }[],
  w: number,
  h: number,
): Particle[] {
  const cx = w / 2;
  const cy = h / 2;

  return points.map((p) => {
    const a = Math.random() * Math.PI * 2;
    const rad = Math.random() ** 2 * 14;
    const sx = cx + Math.cos(a) * rad;
    const sy = cy + Math.sin(a) * rad;
    const curl = (Math.random() - 0.5) * Math.min(w, h) * 0.08;

    return {
      sx,
      sy,
      mx: (sx + p.x) * 0.5 + curl,
      my: (sy + p.y) * 0.5 - Math.abs(curl) * 0.35,
      hx: p.x,
      hy: p.y,
      r: Math.random() * 1.15 + 0.85,
      hue: 40 + Math.random() * 8,
      d: Math.random() * 0.28,
      fade: 0.55 + Math.random() * 0.45,
    };
  });
}