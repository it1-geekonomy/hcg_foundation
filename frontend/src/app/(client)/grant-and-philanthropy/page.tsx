"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { PHILANTHROPY_CARDS, type PhilanthropyCard } from "@/domains/getinvolved/constants/grants-and-philanthropy";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ */
/* Slide-in animations                                                 */
/*  - Top header:      title from left, description from right        */
/*  - Bottom banner:   title from left, description + CTA from right   */
/*  When the layout stacks (below md / 768px) everything is from left. */
/* ------------------------------------------------------------------ */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StyledEl = HTMLElement | SVGElement;

function startPhilanthropyAnimations(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const main = document.querySelector<HTMLElement>("main");
  if (!main || main.dataset.philAnim) return;
  main.dataset.philAnim = "1";
  main.style.overflowX = "clip"; // slide offsets must not create a horizontal scrollbar

  const T = "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
  // Faster transition for the CTA so it lands quickly after the description
  const T_CTA = "opacity 450ms ease-out, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
  const LEFT = -80;
  const STEP = 120;
  const MAXD = 1200;
  const SETTLE = 450; // description looks finished by now (ease-out tail is barely visible)

  // Two columns / row layout starts at md (768px). Below that everything stacks.
  const stacked = !window.matchMedia("(min-width: 768px)").matches;
  const RIGHT = stacked ? LEFT : 80;

  const hide = (el: StyledEl, x: number) => {
    el.style.opacity = "0";
    el.style.transform = `translate3d(${x}px,0,0)`;
    el.style.transition = "none";
    el.style.willChange = "opacity, transform";
  };

  // Trigger is an element that stays on screen (the animated one is translated).
  const watch = (el: Element, cb: () => void) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          cb();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
  };

  const wrap = (root: HTMLElement): HTMLSpanElement[] => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const spans: HTMLSpanElement[] = [];
    nodes.forEach((n) => {
      const t = n.nodeValue || "";
      if (!t.trim()) return;
      const frag = document.createDocumentFragment();
      t.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
          return;
        }
        const s = document.createElement("span");
        s.textContent = p;
        s.style.display = "inline-block";
        frag.appendChild(s);
        spans.push(s);
      });
      n.parentNode?.replaceChild(frag, n);
    });
    return spans;
  };

  // Line-by-line slide-in. onDone fires once the last line has visually settled.
  const lineText = (
    root: HTMLElement | null,
    x: number,
    delay: number,
    onDone?: () => void,
  ) => {
    if (!root) {
      onDone?.();
      return;
    }
    const spans = wrap(root);
    spans.forEach((s) => hide(s, x));
    void root.getBoundingClientRect();
    watch(root, () => {
      let line = -1;
      let top0 = -Infinity;
      const lines = spans.map((s) => {
        const top = s.getBoundingClientRect().top;
        if (Math.abs(top - top0) > 4) {
          line += 1;
          top0 = top;
        }
        return line;
      });
      spans.forEach((s, i) => {
        s.style.transition = T;
        s.style.transitionDelay = `${delay + Math.min(lines[i] * STEP, MAXD)}ms`;
        s.style.opacity = "1";
        s.style.transform = "translate3d(0,0,0)";
      });
      if (onDone) {
        const total = delay + Math.min(Math.max(line, 0) * STEP, MAXD) + SETTLE;
        window.setTimeout(onDone, total);
      }
    });
  };

  // Whole-element slide-in. Optional gate waits for a promise before revealing.
  const slide = (
    el: StyledEl | null,
    x: number,
    delay: number,
    trigger?: Element | null,
    gate?: Promise<void>,
    transition: string = T,
    cleanupMs: number = 1000,
  ) => {
    if (!el) return;
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    hide(el, x);
    void el.getBoundingClientRect();
    watch(trigger || el.parentElement || el, () => {
      const reveal = () => {
        el.style.transition = transition;
        el.style.transitionDelay = `${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
        window.setTimeout(() => {
          // give hover styles back (e.g. the CTA button's hover:scale)
          el.style.opacity = "";
          el.style.transform = "";
          el.style.transition = "";
          el.style.transitionDelay = "";
          el.style.willChange = "";
        }, cleanupMs + delay + 100);
      };
      if (gate) gate.then(reveal);
      else reveal();
    });
  };

  const q = (name: string) => main.querySelector<HTMLElement>(`[data-anim="${name}"]`);

  // 1) Top header: title from left, description from right (left when stacked)
  lineText(q("top-title"), LEFT, 0);
  lineText(q("top-desc"), RIGHT, 200);

  // 2) Bottom banner: title from left, description + CTA from right (left when stacked)
  lineText(q("bottom-title"), LEFT, 0);

  let resolveDesc: () => void = () => { };
  const descDone = new Promise<void>((r) => {
    resolveDesc = r;
  });
  lineText(q("bottom-desc"), RIGHT, 150, resolveDesc);
  // CTA slides in quickly right after the description settles
  slide(q("bottom-cta"), RIGHT, 0, q("bottom-desc"), descDone, T_CTA, 600);
}

function PhilanthropyTiltCard({ card }: { card: PhilanthropyCard }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  // Tilt degrees (max ~7 degrees for elegant, subtle luxury feel)
  const rotateX = tilt.isHovered ? -tilt.y * 14 : 0;
  const rotateY = tilt.isHovered ? tilt.x * 14 : 0;

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${tilt.isHovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)"
            }`,
          boxShadow: tilt.isHovered
            ? `${-tilt.x * 16}px ${-tilt.y * 16 + 18}px 32px -8px rgba(13, 40, 56, 0.12), 0 6px 16px -4px rgba(13, 40, 56, 0.06)`
            : "none",
          transition: tilt.isHovered
            ? "transform 100ms ease-out, box-shadow 100ms ease-out"
            : "transform 600ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 600ms cubic-bezier(0.23, 1, 0.32, 1)",
          transformStyle: "preserve-3d",
        }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-[0.375rem] bg-[#FFFCF3] h-full min-h-0 md:min-h-[24rem] lg:min-h-[28.3125rem] 2xl:min-h-[28.3125rem] cursor-pointer will-change-transform"
      >

        {/* Card Top: Circular Icon Badge + Title + Description */}
        <div
          style={{
            transform: tilt.isHovered ? "translateZ(26px)" : "translateZ(0)",
            transition: "transform 200ms ease-out",
          }}
          className="p-4 sm:p-5 md:p-4 lg:p-[1.25rem] xl:p-[1.5rem] 2xl:p-[2rem] flex items-start gap-3 sm:gap-4 md:gap-3.5 lg:gap-4 xl:gap-[1.25rem] 2xl:gap-[2.38rem] bg-[#FFFCF3]"
        >
          <div
            style={{
              transform: tilt.isHovered ? "translateZ(18px) scale(1.05)" : "translateZ(0) scale(1)",
              transition: "transform 200ms ease-out",
            }}
            className="w-[3rem] h-[3rem] sm:w-[3.5rem] sm:h-[3.5rem] md:w-[3.25rem] md:h-[3.25rem] lg:w-[4rem] lg:h-[4rem] xl:w-[4.75rem] xl:h-[4.75rem] 2xl:w-[6.6875rem] 2xl:h-[6.6875rem] shrink-0 rounded-full bg-[#FFF3CC] flex items-center justify-center p-[0.65rem] sm:p-[0.75rem] md:p-[0.7rem] lg:p-[0.875rem] xl:p-[1rem] 2xl:p-[1.7rem] shadow-xs"
          >
            <img
              src={card.iconUrl}
              alt={card.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="mb-2 sm:mb-2.5 lg:mb-[0.75rem] min-h-[2.5rem] sm:min-h-[2.8rem] md:min-h-[3rem] lg:min-h-[3.6rem] 2xl:min-h-[4.25rem] flex flex-col justify-start">
              <Typography
                variant="heading-10"
                as="h2"
                className="font-argestadisplay font-normal text-[#0D2838] leading-tight"
              >
                {card.title}
              </Typography>
            </div>
            <Typography
              variant="body-12"
              as="p"
              className="font-manrope font-normal text-[#606060]"
            >
              {card.description}
            </Typography>
          </div>
        </div>

        {/* Card Bottom: Full Width Image Asset */}
        <div
          style={{
            transform: tilt.isHovered ? "translateZ(14px)" : "translateZ(0)",
            transition: "transform 200ms ease-out",
          }}
          className="w-full h-[11.5rem] sm:h-[12.5rem] md:h-[11.5rem] lg:h-[13.5rem] xl:h-[14.5rem] 2xl:h-[16.1875rem] shrink-0 overflow-hidden relative bg-[#EFEAD8]"
        >
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover object-[center_top] transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function GrantsAndPhilanthropyPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Slide-in animations (runs once on mount)
  useIsoLayoutEffect(() => {
    startPhilanthropyAnimations();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="Grant & Philanthropy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="Grant & Philanthropy"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="md:col-span-6 lg:col-span-7">
            <div data-anim="top-title">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
              >
                Creating Lasting Change <br className="hidden md:inline" />
                Through Partnership
              </Typography>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-5 flex justify-start md:justify-end">
            <div data-anim="top-desc" className="max-w-[35.5rem] text-left">
              <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-[#596D79]">
                HCG Foundation welcomes partnerships with grant-making foundations, trusts, and philanthropic organizations aligned with our mission of equitable cancer care.
              </Typography>
            </div>
          </div>
        </div>

        {/* 2x2 Vertical Image Cards Grid with 3D Parallax Tilt Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-5 lg:gap-6 xl:gap-[3.06rem]">
          {PHILANTHROPY_CARDS.map((card) => (
            <PhilanthropyTiltCard key={card.id} card={card} />
          ))}
        </div>

        {/* Bottom Impact Banner matching Figma Frame 576 */}
        <div className="mt-10 sm:mt-14 lg:mt-16 rounded-xl bg-[#FFF4CF] px-6 sm:px-10 lg:pl-[3.375rem] lg:pr-[2.875rem] py-6 sm:py-8 lg:pt-[2.25rem] lg:pb-[1.6875rem] flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16">
          <div data-anim="bottom-title" className="shrink-0">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838] leading-tight"
            >
              Creating Lasting Change <br className="hidden md:inline" />
              Through Partnership
            </Typography>
          </div>
          <div className="w-full flex-1 flex flex-col items-start gap-3 sm:gap-3.5 md:max-w-[32rem]">
            <div data-anim="bottom-desc" className="w-full">
              <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-left text-[#121212]">
                Your contribution can help a patient receive care, give a family hope, and help build healthier communities.
              </Typography>
            </div>
            <button
              type="button"
              data-anim="bottom-cta"
              onClick={() => setIsPartnerModalOpen(true)}
              className="self-center md:self-start w-auto px-5 sm:px-6 lg:w-[13.1875rem] h-[2.75rem] sm:h-[3.25rem] lg:h-[3.5625rem] inline-flex items-center justify-center gap-2 sm:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[42px] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2D2D2D] whitespace-nowrap">
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[0.9rem] h-[0.75rem] sm:w-[1.1rem] sm:h-[0.9rem] lg:w-[1.2925rem] lg:h-[1.034rem] shrink-0 text-[#2D2D2D]" />
            </button>
          </div>
        </div>
      </section>

      {/* Partner With Us Modal */}
      <PartnerWithUsModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {/* Donate Form Section */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
