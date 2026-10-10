"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";

const YELLOW_HAND = "/hcg-logo/yellow-hand.png";
const BLUE_HAND = "/hcg-logo/blue-hand.png";
const PINK_HAND = "/hcg-logo/pink-hand.png";
const H_LETTER = "/hcg-logo/H.png";
const C_LETTER = "/hcg-logo/C.png";
const G_LETTER = "/hcg-logo/G.png";

/** Order matters: indexes 0-2 are the hands, 3-5 the letters (see HANDS / LETTERS below). */
const LOGO_URLS = [YELLOW_HAND, BLUE_HAND, PINK_HAND, H_LETTER, C_LETTER, G_LETTER];

type Vec2 = [number, number];
type Vec3 = [number, number, number];

const YELLOW_SIZE: Vec2 = [65, 83];
const BLUE_SIZE: Vec2 = [50, 60];
const PINK_SIZE: Vec2 = [98, 50];

const H_SIZE: Vec2 = [40, 56];
const C_SIZE: Vec2 = [42, 56];
const G_SIZE: Vec2 = [45, 59];

const YELLOW_POS: Vec3 = [-30, 4, 0];
const BLUE_POS: Vec3 = [26, 14, 1];
const PINK_POS: Vec3 = [15, -34, 2];

const HANDS_GROUP_POS: Vec3 = [-95, 5, 0];

const LETTER_GAP = 2;
const H_POS: Vec3 = [32, 35, 3];
const C_POS: Vec3 = [H_POS[0] + H_SIZE[0] / 2 + LETTER_GAP + C_SIZE[0] / 2, 35, 3];
const G_POS: Vec3 = [C_POS[0] + C_SIZE[0] / 2 + LETTER_GAP + G_SIZE[0] / 2, 35, 3];

interface Tween {
  x: number;
  y: number;
  rot: number;
  scale: number;
}

interface Layer {
  src: number;
  size: Vec2;
  start: number;
  dur: number;
  from: Tween;
  to: Tween;
}

function makeFly(
  target: Vec3,
  off: { dx: number; dy: number; rot: number; scale: number },
): { from: Tween; to: Tween } {
  return {
    to: { x: target[0], y: target[1], rot: 0, scale: 1 },
    from: { x: target[0] + off.dx, y: target[1] + off.dy, rot: off.rot, scale: off.scale },
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t: number, overshoot = 1.4): number {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const GROUP_SPIN_START = 0.85;
const GROUP_SPIN_DUR = 0.45;
const SPIN_POP_DUR = 0.2;

const H_START = 1.35;
const H_DUR = 0.32;
const C_START = 1.65;
const C_DUR = 0.32;
const G_START = 1.95;
const G_DUR = 0.32;

const FINAL_POP_START = G_START + G_DUR;
const FINAL_POP_DUR = 0.25;
/** After this the canvas no longer changes, so it stops redrawing. */
const ANIM_END = FINAL_POP_START + FINAL_POP_DUR + 0.05;

const HANDS: Layer[] = [
  { src: 0, size: YELLOW_SIZE, start: 0.05, dur: 0.58, ...makeFly(YELLOW_POS, { dx: -400, dy: 0, rot: -2.44, scale: 0.4 }) },
  { src: 1, size: BLUE_SIZE, start: 0.12, dur: 0.58, ...makeFly(BLUE_POS, { dx: 0, dy: 320, rot: 3.49, scale: 0.4 }) },
  { src: 2, size: PINK_SIZE, start: 0.2, dur: 0.58, ...makeFly(PINK_POS, { dx: 300, dy: -300, rot: 2.79, scale: 0.4 }) },
];

const LETTERS: Layer[] = [
  { src: 3, size: H_SIZE, start: H_START, dur: H_DUR, ...makeFly(H_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 }) },
  { src: 4, size: C_SIZE, start: C_START, dur: C_DUR, ...makeFly(C_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 }) },
  { src: 5, size: G_SIZE, start: G_START, dur: G_DUR, ...makeFly(G_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 }) },
];

/* text lands sooner after the mark settles — less idle gap */
const FOUNDATION_DELAY_MS = 2350;
const SUBTITLE_DELAY_MS = 2500;
const STAR_DELAY_MS = 2650;
const STAR_BLINK_DUR_MS = 400;
const STAR_HIDE_DELAY_MS = STAR_DELAY_MS + STAR_BLINK_DUR_MS;
const COMPLETE_MS = STAR_HIDE_DELAY_MS + 280;
/** Safety net if the tab is hidden / rAF is paused: never leave the visitor stuck on the intro. */
const MAX_WAIT_MS = COMPLETE_MS + 6000;

// ============================================================================
// IMAGE PRELOAD — call preloadHcgLogo() early (IntroSequence does it on mount) so the
// images are already decoded when the logo scene starts. Previously they began loading
// when the scene mounted, so letters could pop in late / out of sync with the text.
// ============================================================================

let logoImagesPromise: Promise<HTMLImageElement[]> | null = null;

export function preloadHcgLogo(): Promise<HTMLImageElement[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  if (!logoImagesPromise) {
    logoImagesPromise = Promise.all(
      LOGO_URLS.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              const decoded = typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve();
              decoded.then(() => resolve(img));
            };
            img.onerror = () => resolve(img); // broken image: simply not drawn
            img.src = url;
          }),
      ),
    );
  }
  return logoImagesPromise;
}

/** Pre-scales a sprite once to its on-screen size so each frame only blits a small bitmap. */
function bakeSprite(img: HTMLImageElement, size: Vec2, dpr: number): CanvasImageSource | null {
  if (!img.naturalWidth) return null;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(size[0] * dpr));
  c.height = Math.max(1, Math.round(size[1] * dpr));
  const g = c.getContext("2d");
  if (!g) return img;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export default function HcgLogoAnimation({
  onDone,
  embedded = false,
}: {
  onDone: () => void;
  embedded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFoundation, setShowFoundation] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Each line's natural text width is measured so it can be scaled to exactly fill the HCG span.
  const foundationTextRef = useRef<HTMLSpanElement>(null);
  const subtitleTextRef = useRef<HTMLSpanElement>(null);
  const [foundationFontPx, setFoundationFontPx] = useState<number | null>(null);
  const [subtitleFontPx, setSubtitleFontPx] = useState<number | null>(null);
  // Text is only revealed once it has been fitted, so it never appears at one size and then jumps.
  const [fitted, setFitted] = useState(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  };

  // --------------------------------------------------------------------------
  // One clock drives the canvas AND the text/star reveals, so they never drift apart.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let raf = 0;
    let startTime = 0;
    let lastT = -1;
    let sprites: (CanvasImageSource | null)[] = [];

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const sizeCanvas = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
    };

    function drawSprite(
      layer: Layer,
      x: number,
      y: number,
      rot: number,
      sx: number,
      sy: number,
      alpha: number,
    ) {
      const src = sprites[layer.src];
      if (!ctx || !src || alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(x, -y); // scene units are y-up, canvas is y-down
      ctx.rotate(-rot);
      ctx.scale(sx, sy);
      ctx.drawImage(src, -layer.size[0] / 2, -layer.size[1] / 2, layer.size[0], layer.size[1]);
      ctx.restore();
    }

    function draw(t: number) {
      if (!ctx) return;
      lastT = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#2D2D2D";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      if (t >= FINAL_POP_START) {
        const p = Math.min((t - FINAL_POP_START) / FINAL_POP_DUR, 1);
        const pop = 1 + Math.sin(p * Math.PI) * (1 - p) * 0.035;
        ctx.scale(pop, pop);
      }

      // Hands group: spins once, then pops
      ctx.save();
      ctx.translate(HANDS_GROUP_POS[0], -HANDS_GROUP_POS[1]);
      if (t >= GROUP_SPIN_START) {
        const p = Math.min((t - GROUP_SPIN_START) / GROUP_SPIN_DUR, 1);
        ctx.rotate(-(easeInOutCubic(p) * Math.PI * 2));
        const spinEnd = GROUP_SPIN_START + GROUP_SPIN_DUR;
        if (t >= spinEnd) {
          const pp = Math.min((t - spinEnd) / SPIN_POP_DUR, 1);
          const pop = 1 + Math.sin(pp * Math.PI) * (1 - pp) * 0.09;
          ctx.scale(pop, pop);
        }
      }
      for (const L of HANDS) {
        if (t < L.start) continue;
        const p = Math.min((t - L.start) / L.dur, 1);
        const e = easeOutBack(p, 0.9);
        const s = lerp(L.from.scale, L.to.scale, e);
        drawSprite(
          L,
          lerp(L.from.x, L.to.x, e),
          lerp(L.from.y, L.to.y, e),
          lerp(L.from.rot, L.to.rot, e),
          s,
          s,
          Math.min(p / 0.45, 1),
        );
      }
      ctx.restore();

      // Letters: fly in with a little squash
      for (const L of LETTERS) {
        if (t < L.start) continue;
        const p = Math.min((t - L.start) / L.dur, 1);
        const e = easeOutBack(p, 1.25);
        const base = lerp(L.from.scale, L.to.scale, e);
        const squash = Math.sin(p * Math.PI) * 0.1;
        drawSprite(
          L,
          lerp(L.from.x, L.to.x, e),
          lerp(L.from.y, L.to.y, e),
          lerp(L.from.rot, L.to.rot, e),
          base * (1 + squash),
          base * (1 - squash * 0.6),
          Math.min(p / 0.35, 1),
        );
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    sizeCanvas();
    draw(0);

    const resizeObserver = new ResizeObserver(() => {
      sizeCanvas();
      draw(Math.max(lastT, 0));
    });
    resizeObserver.observe(container);

    const flags = { foundation: false, subtitle: false, starOn: false, starOff: false, done: false };

    function tick(now: number) {
      if (cancelled) return;
      const ms = now - startTime;

      if (!flags.foundation && ms >= FOUNDATION_DELAY_MS) {
        flags.foundation = true;
        setShowFoundation(true);
      }
      if (!flags.subtitle && ms >= SUBTITLE_DELAY_MS) {
        flags.subtitle = true;
        setShowSubtitle(true);
      }
      if (!flags.starOn && ms >= STAR_DELAY_MS) {
        flags.starOn = true;
        setShowStar(true);
      }
      if (!flags.starOff && ms >= STAR_HIDE_DELAY_MS) {
        flags.starOff = true;
        setShowStar(false);
      }
      if (!flags.done && ms >= COMPLETE_MS) {
        flags.done = true;
        finish();
        return; // nothing left to animate
      }

      // Redraw only while something is moving (plus once at the final pose).
      const drawT = Math.min(ms / 1000, ANIM_END);
      if (drawT !== lastT) draw(drawT);

      raf = requestAnimationFrame(tick);
    }

    preloadHcgLogo().then((imgs) => {
      if (cancelled) return;
      sprites = LOGO_URLS.map((_, i) =>
        imgs[i] ? bakeSprite(imgs[i], i < 3 ? HANDS[i]!.size : LETTERS[i - 3]!.size, dpr) : null,
      );
      startTime = performance.now();
      raf = requestAnimationFrame(tick);
    });

    const safety = window.setTimeout(() => {
      if (!flags.done) {
        flags.done = true;
        finish();
      }
    }, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      resizeObserver.disconnect();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text block is anchored to the LEFT edge of H and stretched to the RIGHT edge of G.
  const lettersLeftX = H_POS[0] - H_SIZE[0] / 2;
  const lettersRightX = G_POS[0] + G_SIZE[0] / 2;
  const lettersWidth = lettersRightX - lettersLeftX;

  const CONTENT_GAP = 8;
  const lettersBottomEdgeY = G_POS[1] - G_SIZE[1] / 2;
  const lettersBottomY = lettersBottomEdgeY - CONTENT_GAP;

  const gTopRightX = G_POS[0] + G_SIZE[0] / 2;
  const gTopRightY = G_POS[1] + G_SIZE[1] / 2;

  // Fit once while the text is still invisible (and again when fonts finish loading); the reveal
  // waits for this, so the size never visibly jumps.
  useLayoutEffect(() => {
    let cancelled = false;

    function fitLine(el: HTMLSpanElement, setPx: (px: number) => void) {
      const currentPx = parseFloat(window.getComputedStyle(el).fontSize);
      const natural = el.offsetWidth;
      if (currentPx > 0 && natural > 0) {
        setPx(currentPx * (lettersWidth / natural));
      }
    }

    function measure() {
      if (foundationTextRef.current) fitLine(foundationTextRef.current, setFoundationFontPx);
      if (subtitleTextRef.current) fitLine(subtitleTextRef.current, setSubtitleFontPx);
    }

    measure();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        measure();
        setFitted(true);
      });
    } else {
      setFitted(true);
    }
    return () => {
      cancelled = true;
    };
  }, [lettersWidth]);

  return (
    <section
      className={`relative flex w-full items-center justify-center bg-black ${
        embedded ? "h-full" : "h-screen"
      }`}
    >
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div
        className="pointer-events-none absolute z-20 flex flex-col items-start overflow-visible"
        style={{
          left: `calc(50% + ${lettersLeftX}px)`,
          top: `calc(50% - ${lettersBottomY}px)`,
          width: `${lettersWidth}px`,
          minHeight: "2.75rem",
        }}
      >
        <Typography
          variant="brand-1"
          as="span"
          className="block w-full whitespace-nowrap text-white antialiased"
          style={{
            fontSize: foundationFontPx ? `${foundationFontPx}px` : undefined,
            lineHeight: 1.49,
            opacity: showFoundation && fitted ? 1 : 0,
            transform: showFoundation && fitted ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 380ms ease-out, transform 480ms cubic-bezier(0.33, 1, 0.32, 1)",
          }}
        >
          <span ref={foundationTextRef}>FOUNDATION</span>
        </Typography>

        <Typography
          variant="brand-2"
          as="span"
          className="mt-1 block w-full whitespace-nowrap text-white antialiased"
          style={{
            fontSize: subtitleFontPx ? `${subtitleFontPx}px` : undefined,
            lineHeight: 1.25,
            opacity: showSubtitle && fitted ? 1 : 0,
            transform: showSubtitle && fitted ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 380ms ease-out, transform 480ms cubic-bezier(0.33, 1, 0.32, 1)",
          }}
        >
          <span ref={subtitleTextRef}>Lasting Inspiration</span>
        </Typography>
      </div>

      <div
        className="pointer-events-none absolute z-20"
        style={{
          left: `calc(50% + ${gTopRightX}px)`,
          top: `calc(50% - ${gTopRightY}px)`,
          transform: "translate(-50%, -50%)",
          opacity: showStar ? 1 : 0,
          transition: "opacity 280ms ease-out",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className={showStar ? "animate-hcg-blink" : undefined}
        >
          <path d="M9 0 L11 7 L18 9 L11 11 L9 18 L7 11 L0 9 L7 7 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {!embedded && (
        <button
          type="button"
          onClick={finish}
          className="absolute right-6 top-6 rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/75"
        >
          Skip
        </button>
      )}

      <style jsx>{`
        @keyframes hcg-blink {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(0.8);
          }
        }
        :global(.animate-hcg-blink) {
          animation: hcg-blink 0.5s ease-in-out 1;
        }
      `}</style>
    </section>
  );
}