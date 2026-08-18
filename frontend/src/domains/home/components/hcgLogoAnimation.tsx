"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const YELLOW_HAND = "/hcg-logo/yellow-hand.png";
const BLUE_HAND = "/hcg-logo/blue-hand.png";
const PINK_HAND = "/hcg-logo/pink-hand.png";
const H_LETTER = "/hcg-logo/H.png";
const C_LETTER = "/hcg-logo/C.png";
const G_LETTER = "/hcg-logo/G.png";

type Vec2 = [number, number];
type Vec3 = [number, number, number];

const YELLOW_SIZE: Vec2 = [65, 83];
const BLUE_SIZE: Vec2 = [50, 60];
const PINK_SIZE: Vec2 = [98, 50];

const H_SIZE: Vec2 = [40, 56];
const C_SIZE: Vec2 = [42, 56];
const G_SIZE: Vec2 = [45, 59];

const YELLOW_POS: Vec3 = [-30, 4, 0];
const BLUE_POS: Vec3 = [26, 30, 1];
const PINK_POS: Vec3 = [15, -34, 2];

const HANDS_GROUP_POS: Vec3 = [-95, 5, 0];

const LETTER_GAP = 2;
const H_POS: Vec3 = [32, 35, 3];
const C_POS: Vec3 = [H_POS[0] + H_SIZE[0] / 2 + LETTER_GAP + C_SIZE[0] / 2, 35, 3];
const G_POS: Vec3 = [C_POS[0] + C_SIZE[0] / 2 + LETTER_GAP + G_SIZE[0] / 2, 35, 3];

interface FlyInOffset {
  dx: number;
  dy: number;
  rot: number;
  scale: number;
}

interface TweenTransform {
  x: number;
  y: number;
  rot: number;
  scale: number;
}

interface TimelineEntry {
  obj: THREE.Mesh;
  start: number;
  dur: number;
  from: TweenTransform;
  to: TweenTransform;
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

/* text lands sooner after the mark settles — less idle gap */
const FOUNDATION_DELAY_MS = 2350;
const SUBTITLE_DELAY_MS = 2500;
const STAR_DELAY_MS = 2650;
const STAR_BLINK_DUR_MS = 400;
const STAR_HIDE_DELAY_MS = STAR_DELAY_MS + STAR_BLINK_DUR_MS;
const COMPLETE_MS = STAR_HIDE_DELAY_MS + 280;

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

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const foundationTimer = setTimeout(() => setShowFoundation(true), FOUNDATION_DELAY_MS);
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), SUBTITLE_DELAY_MS);
    const starShowTimer = setTimeout(() => setShowStar(true), STAR_DELAY_MS);
    const starHideTimer = setTimeout(() => setShowStar(false), STAR_HIDE_DELAY_MS);
    const completeTimer = setTimeout(finish, COMPLETE_MS);
    return () => {
      clearTimeout(foundationTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(starShowTimer);
      clearTimeout(starHideTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const loader = new THREE.TextureLoader();
    function makePlane(url: string, size: Vec2): THREE.Mesh {
      const [w, h] = size;
      const texture = loader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const geometry = new THREE.PlaneGeometry(w, h);
      return new THREE.Mesh(geometry, material);
    }

    const root = new THREE.Group();
    scene.add(root);

    const handsGroup = new THREE.Group();
    handsGroup.position.set(...HANDS_GROUP_POS);
    root.add(handsGroup);

    const yellow = makePlane(YELLOW_HAND, YELLOW_SIZE);
    yellow.position.set(...YELLOW_POS);
    handsGroup.add(yellow);

    const blue = makePlane(BLUE_HAND, BLUE_SIZE);
    blue.position.set(...BLUE_POS);
    handsGroup.add(blue);

    const pink = makePlane(PINK_HAND, PINK_SIZE);
    pink.position.set(...PINK_POS);
    handsGroup.add(pink);

    function buildFlyIn(
      obj: THREE.Mesh,
      localTarget: Vec3,
      offset: FlyInOffset,
    ): { from: TweenTransform; to: TweenTransform } {
      const to: TweenTransform = { x: localTarget[0], y: localTarget[1], rot: 0, scale: 1 };
      const from: TweenTransform = {
        x: localTarget[0] + offset.dx,
        y: localTarget[1] + offset.dy,
        rot: offset.rot,
        scale: offset.scale,
      };
      obj.position.x = from.x;
      obj.position.y = from.y;
      obj.rotation.z = from.rot;
      obj.scale.setScalar(from.scale);
      (obj.material as THREE.MeshBasicMaterial).opacity = 0;
      return { from, to };
    }

    const yellowTween = buildFlyIn(yellow, YELLOW_POS, {
      dx: -400,
      dy: 0,
      rot: -2.44,
      scale: 0.4,
    });
    const blueTween = buildFlyIn(blue, BLUE_POS, { dx: 0, dy: 320, rot: 3.49, scale: 0.4 });
    const pinkTween = buildFlyIn(pink, PINK_POS, { dx: 300, dy: -300, rot: 2.79, scale: 0.4 });

    const handTimeline: TimelineEntry[] = [
      { obj: yellow, start: 0.05, dur: 0.58, ...yellowTween },
      { obj: blue, start: 0.12, dur: 0.58, ...blueTween },
      { obj: pink, start: 0.2, dur: 0.58, ...pinkTween },
    ];

    const hLetter = makePlane(H_LETTER, H_SIZE);
    const cLetter = makePlane(C_LETTER, C_SIZE);
    const gLetter = makePlane(G_LETTER, G_SIZE);
    root.add(hLetter, cLetter, gLetter);

    const hTween = buildFlyIn(hLetter, H_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 });
    const cTween = buildFlyIn(cLetter, C_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 });
    const gTween = buildFlyIn(gLetter, G_POS, { dx: 260, dy: 0, rot: 0, scale: 0.5 });

    const letterTimeline: TimelineEntry[] = [
      { obj: hLetter, start: H_START, dur: H_DUR, ...hTween },
      { obj: cLetter, start: C_START, dur: C_DUR, ...cTween },
      { obj: gLetter, start: G_START, dur: G_DUR, ...gTween },
    ];

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      handTimeline.forEach(({ obj, start, dur, from, to }) => {
        if (t < start) return;
        const p = Math.min((t - start) / dur, 1);
        const e = easeOutBack(p, 0.9);
        obj.position.x = lerp(from.x, to.x, e);
        obj.position.y = lerp(from.y, to.y, e);
        obj.rotation.z = lerp(from.rot, to.rot, e);
        const s = lerp(from.scale, to.scale, e);
        obj.scale.setScalar(s);
        (obj.material as THREE.MeshBasicMaterial).opacity = Math.min(p / 0.45, 1);
      });

      if (t >= GROUP_SPIN_START) {
        const p = Math.min((t - GROUP_SPIN_START) / GROUP_SPIN_DUR, 1);
        const e = easeInOutCubic(p);
        handsGroup.rotation.z = e * Math.PI * 2;

        const spinEnd = GROUP_SPIN_START + GROUP_SPIN_DUR;
        if (t >= spinEnd) {
          const pp = Math.min((t - spinEnd) / SPIN_POP_DUR, 1);
          const pop = 1 + Math.sin(pp * Math.PI) * (1 - pp) * 0.09;
          handsGroup.scale.setScalar(pop);
        }
      }

      letterTimeline.forEach(({ obj, start, dur, from, to }) => {
        if (t < start) return;
        const p = Math.min((t - start) / dur, 1);
        const e = easeOutBack(p, 1.25);
        obj.position.x = lerp(from.x, to.x, e);
        obj.position.y = lerp(from.y, to.y, e);
        obj.rotation.z = lerp(from.rot, to.rot, e);
        const baseScale = lerp(from.scale, to.scale, e);

        const squash = Math.sin(Math.min(p, 1) * Math.PI) * 0.1;
        obj.scale.set(baseScale * (1 + squash), baseScale * (1 - squash * 0.6), 1);

        (obj.material as THREE.MeshBasicMaterial).opacity = Math.min(p / 0.35, 1);
      });

      if (t >= FINAL_POP_START) {
        const p = Math.min((t - FINAL_POP_START) / FINAL_POP_DUR, 1);
        const pop = 1 + Math.sin(p * Math.PI) * (1 - p) * 0.035;
        root.scale.setScalar(pop);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      [yellow, blue, pink, hLetter, cLetter, gLetter].forEach((mesh) => {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const lettersCenterX = (H_POS[0] + G_POS[0]) / 2;
  const CONTENT_GAP = 4;
  const lettersBottomEdgeY = G_POS[1] - G_SIZE[1] / 2;
  const lettersBottomY = lettersBottomEdgeY - CONTENT_GAP;

  const gTopRightX = G_POS[0] + G_SIZE[0] / 2;
  const gTopRightY = G_POS[1] + G_SIZE[1] / 2;

  return (
    <section
      className={`relative flex w-full items-center justify-center overflow-hidden bg-black ${
        embedded ? "h-full" : "h-screen"
      }`}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className="pointer-events-none absolute flex flex-col items-center text-center"
        style={{
          left: `calc(50% + ${lettersCenterX}px)`,
          top: `calc(50% - ${lettersBottomY}px)`,
          transform: "translate(-50%, 0)",
        }}
      >
        <span
          className="text-xl font-bold tracking-wide text-white"
          style={{
            opacity: showFoundation ? 1 : 0,
            transform: showFoundation ? "translateY(0) scale(1)" : "translateY(10px) scale(0.85)",
            transition: "opacity 380ms ease-out, transform 480ms cubic-bezier(0.33, 1, 0.32, 1)",
          }}
        >
          Foundation
        </span>
        <span
          className="mt-1 text-base font-semibold text-white"
          style={{
            opacity: showSubtitle ? 1 : 0,
            transform: showSubtitle ? "translateY(0) scale(1)" : "translateY(10px) scale(0.85)",
            transition: "opacity 380ms ease-out, transform 480ms cubic-bezier(0.33, 1, 0.32, 1)",
          }}
        >
          Lasting inspiration
        </span>
      </div>

      <div
        className="pointer-events-none absolute"
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
