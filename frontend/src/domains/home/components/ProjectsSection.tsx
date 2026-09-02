"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { CARDS, COLLAPSED_WIDTH } from "@/domains/home/constants/project";
import { scrollHomeToHero } from "@/domains/home/utils/heroScrollReset";
import Typography from "@/lib/Typography";

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`h-8 w-8 ${className}`}
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function MoreDetailsButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      onClick={(event) => {
        event.preventDefault();
        scrollHomeToHero({ smooth: true });
      }}
      className={`inline-flex w-fit shrink-0 items-center justify-center gap-2 bg-[#FFD43B] px-5 py-3.5 uppercase tracking-wider text-neutral-900 transition-colors hover:bg-[#f0c527] ${className}`}
    >
      <Typography variant="button-1" as="span" className="uppercase text-neutral-900">
        More details
      </Typography>
      <ArrowIcon />
    </Link>
  )
}

// Mobile/tablet (below lg) accordion sizing
const MOBILE_COLLAPSED_HEIGHT = 112;
const MOBILE_EXPANDED_EXTRA = 200; // space above panel (image peek) + panel padding/margins

export default function VerticalCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotionRef = useRef(false);

  const timelineRefs = useRef<(gsap.core.Timeline | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  // ----- Mobile / tablet (below lg) accordion state -----
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileTimelineRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const mobilePanelContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileHasMounted = useRef(false);

  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);
  const [mobileContentHeights, setMobileContentHeights] = useState<number[]>([]);

  // Measure each card's expanded panel content height (badge + title + date + desc + cta)
  useLayoutEffect(() => {
    const checkAll = () => {
      const blocks = mobilePanelContentRefs.current;
      const heights = blocks.map((block) => (block ? block.scrollHeight : 0));
      setMobileContentHeights((prev) => {
        if (prev.length === heights.length && prev.every((h, i) => h === heights[i])) {
          return prev;
        }
        return heights;
      });
    };

    const ro = new ResizeObserver(checkAll);
    mobilePanelContentRefs.current.forEach((block) => {
      if (block) ro.observe(block);
    });

    const raf = requestAnimationFrame(checkAll);
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        if (!cancelled) checkAll();
      });
    }
    window.addEventListener("resize", checkAll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkAll);
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

    if (!reduceMotionRef.current && cards.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "opacity,transform",
      });
    }

    return () => {
      gsap.killTweensOf(cards);
      cards.forEach((card) => gsap.killTweensOf(card.querySelectorAll("*")));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Desktop (lg+) hover accordion animation — unchanged -----
  useEffect(() => {
    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
    const reduceMotion = reduceMotionRef.current;

    cards.forEach((card, index) => {
      const tint = card.querySelector<HTMLElement>(".card-tint");
      const image = card.querySelector<HTMLElement>(".card-image");
      const badgeCollapsed = card.querySelector<HTMLElement>(".card-badge-collapsed");
      const verticalLabel = card.querySelector<HTMLElement>(".card-vertical-label");
      const panel = card.querySelector<HTMLElement>(".card-panel");
      const panelBadge = card.querySelector<HTMLElement>(".panel-badge");
      const title = card.querySelector<HTMLElement>(".panel-title");
      const date = card.querySelector<HTMLElement>(".panel-date");
      const desc = card.querySelector<HTMLElement>(".panel-desc");
      const cta = card.querySelector<HTMLElement>(".panel-cta");
      if (!tint || !image || !badgeCollapsed || !verticalLabel || !panel || !panelBadge || !title || !date || !desc || !cta)
        return;

      const isActive = index === activeIndex;
      const d = reduceMotion ? 0.001 : 0.65;

      timelineRefs.current[index]?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto", duration: d },
      });
      timelineRefs.current[index] = tl;

      tl.to(
        card,
        {
          flexGrow: isActive ? 1 : 0,
          flexShrink: isActive ? 1 : 0,
          flexBasis: isActive ? "0px" : `${COLLAPSED_WIDTH}px`,
        },
        0
      )
        .to(image, { scale: isActive ? 1 : 1.1, duration: reduceMotion ? 0.001 : 1.2, ease: "power2.out" }, 0)
        .to(tint, { opacity: isActive ? 0 : 1, duration: reduceMotion ? 0.001 : 0.5 }, 0);

      if (isActive) {
        tl.to(
          [badgeCollapsed, verticalLabel],
          { opacity: 0, duration: reduceMotion ? 0.001 : 0.16 },
          0
        );

        const panelStart = reduceMotion ? 0.001 : 0.2;
        tl.fromTo(
          panel,
          { opacity: 0, y: 24, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.001 : 0.5 },
          panelStart
        )
          .fromTo(panelBadge, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.08)
          .fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.4 }, panelStart + 0.12)
          .fromTo(date, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.18)
          .fromTo(desc, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.24)
          .fromTo(cta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.3)
          .call(() => {
            panel.style.pointerEvents = "auto";
          });
      } else {
        const panelOutDuration = reduceMotion ? 0.001 : 0.26;
        tl.to(panel, { opacity: 0, y: 16, scale: 0.97, duration: panelOutDuration, ease: "power2.in" }, 0)
          .set(panel, { pointerEvents: "none" });

        const collapsedStart = reduceMotion ? 0.001 : panelOutDuration + 0.04;
        tl.to(
          [badgeCollapsed, verticalLabel],
          { opacity: 1, duration: reduceMotion ? 0.001 : 0.25 },
          collapsedStart
        );
      }
    });

    return () => {
      timelineRefs.current.forEach((tl) => tl?.kill());
    };
  }, [activeIndex]);

  // ----- Mobile / tablet (below lg) click accordion animation -----
  useEffect(() => {
    const reduceMotion = reduceMotionRef.current;
    const cards = mobileCardsRef.current;
    const skipAnim = !mobileHasMounted.current && mobileContentHeights.length === 0;

    cards.forEach((card, index) => {
      if (!card) return;

      const tint = card.querySelector<HTMLElement>(".m-card-tint");
      const image = card.querySelector<HTMLElement>(".m-card-image");
      const collapsedRow = card.querySelector<HTMLElement>(".m-card-collapsed");
      const panel = card.querySelector<HTMLElement>(".m-card-panel");
      const panelBadge = card.querySelector<HTMLElement>(".m-panel-badge");
      const title = card.querySelector<HTMLElement>(".m-panel-title");
      const date = card.querySelector<HTMLElement>(".m-panel-date");
      const desc = card.querySelector<HTMLElement>(".m-panel-desc");
      const cta = card.querySelector<HTMLElement>(".m-panel-cta");
      if (!tint || !image || !collapsedRow || !panel || !panelBadge || !title || !date || !desc || !cta)
        return;

      const isActive = index === mobileActiveIndex;
      const contentHeight = mobileContentHeights[index] || 0;
      const targetHeight = isActive ? contentHeight + MOBILE_EXPANDED_EXTRA : MOBILE_COLLAPSED_HEIGHT;
      const instant = reduceMotion || skipAnim;
      const d = instant ? 0.001 : 0.6;

      mobileTimelineRefs.current[index]?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
      });
      mobileTimelineRefs.current[index] = tl;

      tl.to(card, { height: targetHeight, duration: d }, 0)
        .to(image, { scale: isActive ? 1 : 1.08, duration: instant ? 0.001 : 0.9, ease: "power2.out" }, 0)
        .to(tint, { opacity: isActive ? 0 : 1, duration: instant ? 0.001 : 0.4 }, 0);

      if (isActive) {
        tl.to(collapsedRow, { opacity: 0, duration: instant ? 0.001 : 0.15 }, 0);

        const panelStart = instant ? 0.001 : 0.18;
        tl.fromTo(
          panel,
          { opacity: 0, y: 20, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: instant ? 0.001 : 0.42 },
          panelStart
        )
          .fromTo(panelBadge, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: instant ? 0.001 : 0.3 }, panelStart + 0.05)
          .fromTo(title, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: instant ? 0.001 : 0.3 }, panelStart + 0.09)
          .fromTo(date, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: instant ? 0.001 : 0.28 }, panelStart + 0.14)
          .fromTo(desc, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: instant ? 0.001 : 0.28 }, panelStart + 0.19)
          .fromTo(cta, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: instant ? 0.001 : 0.28 }, panelStart + 0.24)
          .call(() => {
            panel.style.pointerEvents = "auto";
          });
      } else {
        const panelOut = instant ? 0.001 : 0.2;
        tl.to(panel, { opacity: 0, y: 12, scale: 0.98, duration: panelOut, ease: "power2.in" }, 0)
          .set(panel, { pointerEvents: "none" });

        const collapsedStart = instant ? 0.001 : panelOut + 0.03;
        tl.to(collapsedRow, { opacity: 1, duration: instant ? 0.001 : 0.2 }, collapsedStart);
      }
    });

    if (mobileContentHeights.length > 0) {
      mobileHasMounted.current = true;
    }

    return () => {
      mobileTimelineRefs.current.forEach((tl) => tl?.kill());
    };
  }, [mobileActiveIndex, mobileContentHeights]);

  return (
    <section ref={sectionRef} className="text-black bg-[#FFF6D8] pb-8 pt-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="max-w-full">
        <div className="mb-10 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <Typography variant="heading-2"
            as="h2"
            className="w-full text-left font-medium font-tiempos-headline text-[#382E07]"
          >
            Changing Lives Through
            <br className="hidden 2xl:block" />
            {" "}
            HCG Foundation Projects
          </Typography>
          <Typography variant="body-2"
            as="p"
            className="w-full lg:max-w-md xl:max-w-xl leading-6 text-black/60 lg:pt-2 lg:text-left font-argestadisplay font-normal"
          >
            Explore the programs and community initiatives that are creating
            meaningful impact across healthcare, awareness, education, and
            patient support.
          </Typography>
        </div>

        {/* Desktop (lg+) — unchanged */}
        <div
          ref={containerRef}
          className="hidden h-[480px] w-full gap-3 overflow-hidden rounded-2xl lg:flex xl:h-[600px]"
          onMouseLeave={() => setActiveIndex(0)}
        >
          {CARDS.map((card, index) => (
            <div
              key={card.number}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              role="button"
              tabIndex={0}
              aria-expanded={index === activeIndex}
              aria-label={card.title}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              style={{ willChange: "flex-grow, flex-basis" }}
            >
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="card-image absolute inset-0 h-full w-full object-cover will-change-transform"
              />

              <div
                className="card-tint absolute inset-0 bg-[#FFD43B6E]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />

              <div className="card-badge-collapsed absolute left-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">
                <Typography variant="caption-1" as="span" className="text-white">
                  {card.number}
                </Typography>
              </div>

              <div className="card-vertical-label absolute inset-x-0 bottom-6 z-20 flex justify-center">
                <span
                  className="whitespace-nowrap font-medium text-white"
                  style={{ writingMode: "vertical-rl", transform: "rotate(360deg)" }}
                >
                  <Typography variant="body-2" as="span" className="text-white font-medium font-manrope">
                    {card.title}
                  </Typography>
                </span>
              </div>

              <div
                className="card-panel pointer-events-none absolute bottom-5 right-5 top-5 z-30 flex h-[calc(100%-2.5rem)] w-[clamp(26rem,78%,44rem)] flex-col overflow-y-auto rounded-2xl bg-[#8D8D8D66] p-6 opacity-0 shadow-2xl backdrop-blur-xl xl:w-[clamp(18rem,48%,30rem)]" style={{ transformOrigin: "top right" }}
              >
                <div className="panel-badge mb-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography variant="caption-1" as="span" className="text-white">
                    {card.number}
                  </Typography>
                </div>

                <Typography variant="heading-7" as="h3" className="panel-title mb-18 xl:mb-36 text-white font-bold font-manrope">
                  {card.title}
                </Typography>

                <div className="panel-date mb-8 flex items-center gap-2 text-white/90">
                  <div className="relative h-4 w-4">
                    <Image
                      src="/calendar1.png"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Typography variant="text-2" as="span" className="text-white font-normal font-manrope">
                    Project Date: {card.date}
                  </Typography>
                </div>

                <Typography variant="body-7" as="p" className="panel-desc mb-6 text-white font-light font-manrope" >
                  {card.description}
                </Typography>

                <MoreDetailsButton className="panel-cta mt-4 font-semibold font-manrope" />
              </div>
            </div>
          ))}
        </div>

        {/* Below lg — vertical accordion, single column, one card open at a time */}
        <div className="flex flex-col gap-3 lg:hidden">
          {CARDS.map((card, index) => (
            <div
              key={card.number}
              ref={(el) => {
                mobileCardsRef.current[index] = el;
              }}
              role="button"
              tabIndex={0}
              aria-expanded={index === mobileActiveIndex}
              aria-label={card.title}
              onClick={() => setMobileActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMobileActiveIndex(index);
                }
              }}
                className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                index === mobileActiveIndex ? "min-h-[420px] sm:min-h-[460px]" : "h-[112px]"
              }`}
              style={{ willChange: "height" }}
            >
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="m-card-image absolute inset-0 h-full w-full object-cover will-change-transform"
              />

              <div className="m-card-tint absolute inset-0 bg-[#FFD43B6E]" />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

              {/* Collapsed row: badge + title */}
              <div className="m-card-collapsed absolute inset-0 z-20 flex items-center gap-3 px-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography variant="caption-1" as="span" className="text-white">
                    {card.number}
                  </Typography>
                </div>
                <Typography variant="heading-7" as="span" className="truncate text-white font-semibold font-manrope">
                  {card.title}
                </Typography>
              </div>

              {/* Expanded panel */}
              <div
                className="m-card-panel pointer-events-none absolute inset-x-4 bottom-4 z-30 flex max-h-[calc(100%-2rem)] flex-col overflow-y-auto rounded-2xl bg-[#8D8D8D66] p-4 opacity-0 shadow-2xl backdrop-blur-xl"
                style={{ transformOrigin: "bottom center" }}
              >
                <div
                  ref={(el) => {
                    mobilePanelContentRefs.current[index] = el;
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="m-panel-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                      <Typography variant="caption-1" as="span" className="text-white">
                        {card.number}
                      </Typography>
                    </div>

                    <Typography variant="heading-7" as="h3" className="m-panel-title min-w-0 text-white font-bold font-manrope">
                      {card.title}
                    </Typography>
                  </div>

                  <div className="m-panel-date mb-3 flex items-center gap-2 text-white/90">
                    <div className="relative h-4 w-4">
                      <Image
                        src="/calendar1.png"
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Typography variant="text-2" as="span" className="text-white font-normal font-manrope">
                      Project Date: {card.date}
                    </Typography>
                  </div>

                  <Typography variant="body-7" as="p" className="m-panel-desc mb-4 text-white font-light font-manrope">
                    {card.description}
                  </Typography>

                  <MoreDetailsButton className="m-panel-cta font-semibold font-manrope px-4 py-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}