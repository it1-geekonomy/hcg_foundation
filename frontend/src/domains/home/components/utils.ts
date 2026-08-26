export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const easeIn = (t: number) => t * t * t;

export const easeSmooth = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export function numeralFontSize(w: number, h: number) {
  return Math.min(w * 0.15, h * 0.34, 176);
}

export function numeralFont(size: number) {
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

export function sampleText(
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

export function drawSolidNumeral(
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
