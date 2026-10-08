"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import gsap from "gsap";
import type { Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { CARD_IMAGE_BOTTOM_INSET_CLASS, cx, personKey } from "./team-utils";
const CARD_TOP_OFFSET_CLASS = "-top-[clamp(1.25rem,6vw,1.875rem)]";
/**
 * Card body only (yellow face down to the photo's bottom edge). It must not reach into the
 * photo's raised top, or cut-out photos show it as a box floating above the card.
 */
const CARD_BODY_CLASS = cx("absolute inset-x-0 top-0 rounded-md", CARD_IMAGE_BOTTOM_INSET_CLASS);

/** Horizontal distance between neighbouring cards, as a fraction of the card width. */
const SPREAD = 0.5;
const SIDE_SCALE_DROP = 0.16;
const SIDE_DIM = 0.2;
const SWIPE_DISTANCE_PX = 45;
/** A quick flick (px/ms) advances even when the drag distance is short. */
const SWIPE_VELOCITY = 0.35;
const TAP_SLOP_PX = 8;

type DragState = {
  id: number;
  x: number;
  y: number;
  t: number;
  dx: number;
  axis: "x" | "y" | null;
};

/** Mobile stacked carousel: centre card raised in front, smaller neighbours tucked behind each side; swipe to move. */
export function CoverflowCarousel({ people, label }: { people: Person[]; label: string }) {
  const count = people.length;
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** One continuous value drives every card, so drag, settle and reveal never fight each other. */
  const motion = useRef({ pos: 0, spread: 0, reveal: 0 });
  const activeRef = useRef(0);
  const stepPxRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const lastSwipeAtRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const render = useCallback(() => {
    const { pos, spread, reveal } = motion.current;
    for (let i = 0; i < count; i++) {
      const slide = slideRefs.current[i];
      if (!slide) continue;
      const rel = i - pos;
      const abs = Math.abs(rel);
      const near = Math.min(abs, 1);
      const scale = (1 - Math.min(abs, 1.5) * SIDE_SCALE_DROP) * (0.94 + 0.06 * reveal);
      const fade = abs <= 1 ? 1 : Math.max(0, 1 - (abs - 1) * 2.5);

      slide.style.transform = `translate3d(${rel * SPREAD * 100 * spread}%, ${(1 - reveal) * 28}px, 0) scale(${scale})`;
      slide.style.opacity = String(fade * reveal);
      slide.style.filter = `brightness(${1 - near * SIDE_DIM}) saturate(${1 - near * 0.25})`;
      slide.style.zIndex = String(100 - Math.round(abs * 10));
      slide.style.pointerEvents = fade * reveal < 0.5 ? "none" : "";

      const shadow = shadowRefs.current[i];
      if (shadow) {
        shadow.style.boxShadow = `0 ${18 - near * 10}px ${40 - near * 22}px rgba(56,46,7,${0.22 - near * 0.12})`;
      }
    }
  }, [count]);

  const tweenTo = useCallback(
    (vars: gsap.TweenVars) =>
      gsap.to(motion.current, {
        ...vars,
        duration: reducedMotionRef.current ? 0 : vars.duration,
        overwrite: "auto",
        onUpdate: render,
      }),
    [render],
  );

  const settleOn = useCallback(
    (index: number) => {
      const next = Math.min(Math.max(index, 0), count - 1);
      activeRef.current = next;
      setActive(next);
      tweenTo({ pos: next, duration: 0.95, ease: "power4.out" });
    },
    [count, tweenTo],
  );

  useLayoutEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamped = Math.min(activeRef.current, Math.max(count - 1, 0));
    activeRef.current = clamped;
    motion.current.pos = clamped;
    if (reducedMotionRef.current) {
      motion.current.spread = 1;
      motion.current.reveal = 1;
    }
    setActive(clamped);
    render();
  }, [count, render]);

  // Fan the side cards out from behind the centre card the first time the carousel scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        gsap.to(motion.current, { reveal: 1, duration: 0.9, ease: "power3.out", onUpdate: render });
        gsap.to(motion.current, { spread: 1, duration: 1.3, delay: 0.15, ease: "expo.out", onUpdate: render });
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [render]);

  useEffect(() => {
    const stage = stageRef.current;
    const state = motion.current;
    if (!stage) return;
    const measure = () => {
      stepPxRef.current = stage.offsetWidth * SPREAD;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      gsap.killTweensOf(state);
    };
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, axis: null };
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const rawDx = e.clientX - d.x;
    const dy = e.clientY - d.y;

    if (!d.axis) {
      if (Math.abs(rawDx) < TAP_SLOP_PX && Math.abs(dy) < TAP_SLOP_PX) return;
      d.axis = Math.abs(rawDx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "y") return;
      // Capture only once it's clearly a swipe, so plain taps still reach the card.
      try {
        zoneRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already gone (e.g. lifted mid-frame); the drag still ends on pointerup.
      }
    }
    if (d.axis !== "x") return;

    const step = stepPxRef.current || 1;
    const base = activeRef.current;
    // One card per gesture, and no pulling past the first or last card.
    const min = Math.max(base - 1, 0);
    const max = Math.min(base + 1, count - 1);
    const target = Math.min(max, Math.max(min, base - rawDx / step));
    d.dx = (base - target) * step;

    tweenTo({ pos: target, duration: 0.35, ease: "power3.out" });
  };

  const finishDrag = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    if (d.axis !== "x") return;

    lastSwipeAtRef.current = Date.now();
    if (zoneRef.current?.hasPointerCapture(e.pointerId)) {
      zoneRef.current.releasePointerCapture(e.pointerId);
    }

    const velocity = d.dx / Math.max(performance.now() - d.t, 1);
    const flicked = Math.abs(velocity) > SWIPE_VELOCITY && Math.abs(d.dx) > 15;
    const advance = Math.abs(d.dx) >= SWIPE_DISTANCE_PX || flicked;
    settleOn(advance ? activeRef.current + (d.dx < 0 ? 1 : -1) : activeRef.current);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      settleOn(activeRef.current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      settleOn(activeRef.current - 1);
    }
  };

  const onSlideClickCapture = (e: MouseEvent, index: number) => {
    // A swipe or a tap on a side card should move the carousel, not flip the card.
    const justSwiped = Date.now() - lastSwipeAtRef.current < 400;
    if (justSwiped || index !== activeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      if (!justSwiped) settleOn(index);
    }
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative isolate w-full overflow-x-clip outline-none"
    >
      <div
        ref={zoneRef}
        className="pt-9 pb-3"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={(e) => {
          // Touch pointers start implicitly captured by the card under the finger; moving the
          // capture to this zone fires a bubbling lostpointercapture from that card, not a real end.
          if (e.target === zoneRef.current) finishDrag(e);
        }}
      >
        <div ref={stageRef} className="relative mx-auto w-[min(17rem,72vw)]">
          <div aria-hidden className="invisible aspect-320/380" />

          {people.map((person, i) => (
            <div
              key={personKey(person, i)}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              aria-hidden={i !== active}
              onClickCapture={(e) => onSlideClickCapture(e, i)}
              className="absolute inset-0 opacity-0 will-change-transform"
            >
              {/* Cards fade to transparent and some photos are cut-outs; keep cards behind from bleeding through. */}
              <div
                ref={(el) => {
                  shadowRefs.current[i] = el;
                }}
                aria-hidden
                className={cx(CARD_BODY_CLASS, "bg-[#FFF6D8]")}
              />
              <PersonCard
                {...person}
                widthClass="w-full"
                topOffsetClass={CARD_TOP_OFFSET_CLASS}
                flipEnabled={i === active}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}