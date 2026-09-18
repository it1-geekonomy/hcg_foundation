"use client";

import { useEffect, useRef, useState } from "react";
import { SM_FLUID_CARD_WIDTH, type Person } from "@/domains/about/constants/teams";
import { PersonCard } from "./PersonCard";
import { ArrowButton } from "./TeamIcons";
import { MOBILE_CARD_GAP_PX, cx, personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

/** Scroll-snap carousel for mobile / tablet. */
export function ArrowScrollCarousel({ people }: { people: Person[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(people.length <= 1);
  const { setRef: setLabelRef, height: labelHeight } =
    useSyncedLabelHeight(people.length);

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card
      ? card.offsetWidth + MOBILE_CARD_GAP_PX
      : el.clientWidth;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <div
      className={cx(
        "mx-auto flex w-full max-w-[1260px] items-center gap-1",
        "max-sm:-mx-8",
        "max-sm:w-[calc(100%+4rem)]",
        "max-sm:justify-center",
        "max-sm:gap-0",
      )}
    >
      <ArrowButton
        direction="left"
        disabled={atStart}
        onClick={() => scrollByCard(-1)}
      />

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
          "max-sm:pt-9",
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

      <ArrowButton
        direction="right"
        disabled={atEnd}
        onClick={() => scrollByCard(1)}
      />
    </div>
  );
}
