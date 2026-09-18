"use client";

import { useEffect, useRef, useState } from "react";
import { SM_FLUID_CARD_WIDTH, type Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { ArrowButton } from "./TeamIcons";
import { MOBILE_CARD_GAP_PX, cx, personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

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
    // The visible card face (yellow bg) — matches the blue rectangle in the UI.
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
      )}
    >
      <div className="h-10 w-10 flex-none" aria-hidden />

      <div
        className="absolute left-0 z-10 -translate-y-1/2"
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
        className={cx(
          "min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth pt-9 pb-2",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
          "max-sm:w-[16.25rem]",
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
                "max-sm:w-[16.25rem]",
                "w-full",
                SM_FLUID_CARD_WIDTH,
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

      <div className="h-10 w-10 flex-none" aria-hidden />

      <div
        className="absolute right-0 z-10 -translate-y-1/2"
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
