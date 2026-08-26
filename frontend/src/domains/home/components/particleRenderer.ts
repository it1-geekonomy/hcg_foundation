import { type Particle } from "../constants/footer";
import { easeSmooth, clamp01 } from "./utils";

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  progress: number,
  particleAlpha: number,
  stage: string,
  merge: number,
) {
  if (particleAlpha <= 0.01) return;

  for (const q of particles) {
    const u = easeSmooth(clamp01((progress - q.d) / (1 - q.d)));
    const omu = 1 - u;

    const x = omu * omu * q.sx + 2 * omu * u * q.mx + u * u * q.hx;
    const y = omu * omu * q.sy + 2 * omu * u * q.my + u * u * q.hy;

    const melt = stage === "solid" ? merge : 0;
    const size = q.r * (0.9 + u * 0.15) * (1 + melt * 1.15);
    const a = particleAlpha * q.fade;

    if (a <= 0.01) continue;

    const light = 64 + melt * 6;
    const sat = 80 - melt * 6;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${q.hue}, ${sat}%, ${light}%, ${a})`;
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
