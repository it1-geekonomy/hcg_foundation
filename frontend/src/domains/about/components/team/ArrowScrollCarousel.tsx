"use client";

import { useEffect, useRef, useState } from "react";
import { SM_FLUID_CARD_WIDTH, type Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { ArrowButton } from "./TeamIcons";
import { MOBILE_CARD_GAP_PX, cx, personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

/** Minimum horizontal drag (px) before a touch swipe counts as a "next/prev" gesture. */
const SWIPE_THRESHOLD_PX = 30;
/** Cooldown (ms) after a wheel-triggered card shift, so one continuous trackpad
 *  swipe (many wheel events) still only moves the carousel by one card. */
const WHEEL_LOCK_MS = 500;

/** Scroll-snap carousel for mobile / tablet. */
export function ArrowScrollCarousel({ people }: { people: Person[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(people.length <= 1);
  /** Midpoint of the visible card (image ∪ yellow face), relative to root. */
  const [arrowCenterY, setArrowCenterY] = useState<number | null>(null);
  const { setRef: setLabelRef, height: labelHeight } =
    useSyncedLabelHeight(people.length);

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  };

  const measureArrowCenter = () => {
    const root = rootRef.current;
    const cardFace =
      scrollRef.current?.querySelector<HTMLElement>("[data-yellow-bg]") ??
      scrollRef.current?.querySelector<HTMLElement>("[data-card]");
    if (!root || !cardFace) return;

    const rootRect = root.getBoundingClientRect();
    const cardRect = cardFace.getBoundingClientRect();
    setArrowCenterY(cardRect.top - rootRect.top + cardRect.height / 2);
  };

  useEffect(() => {
    updateEdges();
    const raf = window.requestAnimationFrame(() => measureArrowCenter());

    const el = scrollRef.current;
    if (!el) {
      return () => window.cancelAnimationFrame(raf);
    }

    const onResize = () => {
      updateEdges();
      measureArrowCenter();
    };
    window.addEventListener("resize", onResize);

    const cardFace =
      el.querySelector<HTMLElement>("[data-yellow-bg]") ??
      el.querySelector<HTMLElement>("[data-card]");
    const ro =
      cardFace && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureArrowCenter())
        : null;
    if (ro && cardFace) ro.observe(cardFace);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [people.length, labelHeight]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card
      ? card.offsetWidth + MOBILE_CARD_GAP_PX
      : el.clientWidth;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  // One-card-per-gesture: take over the horizontal swipe/scroll so a fast
  // flick or a long trackpad swipe still only ever advances a single card.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // ---- Wheel / trackpad horizontal scroll ----
    let wheelLocked = false;
    let wheelResetTimer: number | null = null;

    const onWheel = (e: WheelEvent) => {
      const horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontalIntent) return; // let normal vertical page scroll pass through
      e.preventDefault();
      if (wheelLocked || Math.abs(e.deltaX) < 5) return;

      wheelLocked = true;
      scrollByCard(e.deltaX > 0 ? 1 : -1);

      if (wheelResetTimer != null) window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelLocked = false;
      }, WHEEL_LOCK_MS);
    };

    // ---- Touch drag (one-hand swipe) ----
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let axis: "x" | "y" | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
      axis = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x") {
        // Own the gesture: block native scroll so it can't outrun our
        // "shift exactly one card" rule, while vertical page scroll (axis "y")
        // is left completely alone.
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      dragging = false;
      if (axis !== "x") return;

      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        scrollByCard(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      if (wheelResetTimer != null) window.clearTimeout(wheelResetTimer);
    };
  }, []);

  const arrowStyle =
    arrowCenterY != null
      ? ({ top: arrowCenterY } as const)
      : ({ top: "50%" } as const);

  return (
    <div
      ref={rootRef}
      className={cx(
        "relative mx-auto flex w-full max-w-[1260px] items-start gap-1",
        "max-sm:-mx-8",
        "max-sm:w-[calc(100%+4rem)]",
        "max-sm:justify-center",
        "max-sm:gap-0",
        "min-[640px]:max-[767px]:!gap-[6px]",
      )}
    >
      {/* Left spacer — the arrow's own positioning box on mobile so it hugs
          the image instead of sitting at the screen edge. */}
      <div
        className={cx(
          "h-10 w-10 flex-none",
          "max-sm:relative max-sm:z-10",
          "min-[640px]:max-[767px]:!w-6",
        )}
        aria-hidden
      >
        <div
          className="hidden max-sm:block max-sm:absolute max-sm:left-1/2 max-sm:-translate-x-1/2"
          style={arrowStyle}
        >
          <ArrowButton
            direction="left"
            disabled={atStart}
            onClick={() => scrollByCard(-1)}
          />
        </div>
      </div>

      {/* Tablet / desktop arrow — positioned against the full row, as before. */}
      <div
        className="absolute left-0 z-10 -translate-y-1/2 max-sm:hidden"
        style={arrowStyle}
      >
        <ArrowButton
          direction="left"
          disabled={atStart}
          onClick={() => scrollByCard(-1)}
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={updateEdges}
        style={{ touchAction: "pan-y" }}
        className={cx(
          "min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth pt-9 pb-2",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
          "max-sm:w-[17rem]",
          "max-sm:flex-none",
          "max-sm:pb-0",
        )}
      >
        <div className={cx("flex gap-4", "max-sm:gap-0")}>
          {people.map((p, i) => (
            <div
              key={personKey(p, i)}
              data-card
              className={cx(
                "flex-none snap-center sm:snap-start",
                "max-sm:w-[17rem]",
                "w-full",
                SM_FLUID_CARD_WIDTH,
                "min-[640px]:max-[767px]:!w-[calc(50%-0.5rem)]",
              )}
            >
              <PersonCard
                {...p}
                widthClass="w-full"
                fadeBottom
                wrapLabel
                dropShadow={false}
                topOffsetClass="-top-[clamp(1.25rem,6vw,1.875rem)]"
                labelRef={setLabelRef(i)}
                labelHeight={labelHeight}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right spacer / arrow, mirrored */}
      <div
        className={cx(
          "h-10 w-10 flex-none",
          "max-sm:relative max-sm:z-10",
          "min-[640px]:max-[767px]:!w-6",
        )}
        aria-hidden
      >
        <div
          className="hidden max-sm:block max-sm:absolute max-sm:right-1/2 max-sm:translate-x-1/2"
          style={arrowStyle}
        >
          <ArrowButton
            direction="right"
            disabled={atEnd}
            onClick={() => scrollByCard(1)}
          />
        </div>
      </div>

      <div
        className="absolute right-0 z-10 -translate-y-1/2 max-sm:hidden"
        style={arrowStyle}
      >
        <ArrowButton
          direction="right"
          disabled={atEnd}
          onClick={() => scrollByCard(1)}
        />
      </div>
    </div>
  );
}