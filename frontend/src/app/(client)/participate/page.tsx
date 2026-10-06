"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import ParticipateModal, {
  ParticipateModalType,
} from "@/shared/components/ParticipateModal";
import {
  PARTICIPATE_CARDS,
  PARTICIPATE_BENEFITS,
} from "@/domains/getinvolved/constants/participate";
import Banner from "@/shared/components/Herobannersection";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ */
/* Animations                                                          */
/*  - Top header:   eyebrow + title slide from left, description from  */
/*                  right (all from left when the layout stacks).      */
/*  - Benefits bar: icon, heading and description use the same         */
/*                  blur + rise reveal as the StatSection heading.     */
/* ------------------------------------------------------------------ */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StyledEl = HTMLElement | SVGElement;

function startParticipateAnimations(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const main = document.querySelector<HTMLElement>("main");
  if (!main || main.dataset.participateAnim) return;
  main.dataset.participateAnim = "1";
  main.style.overflowX = "clip"; // slide offsets must not create a horizontal scrollbar

  const T = "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
  // Same timing as the StatSection heading reveal
  const T_BLUR =
    "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)";
  const LEFT = -80;
  const STEP = 120;
  const MAXD = 1200;

  // Row layout starts at md (768px). Below that everything stacks.
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

  // Line-by-line slide-in.
  const lineText = (root: HTMLElement | null, x: number, delay: number) => {
    if (!root) return;
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
    });
  };

  // Whole-element slide-in.
  const slide = (el: StyledEl | null, x: number, delay: number, trigger?: Element | null) => {
    if (!el) return;
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    hide(el, x);
    void el.getBoundingClientRect();
    watch(trigger || el.parentElement || el, () => {
      el.style.transition = T;
      el.style.transitionDelay = `${delay}ms`;
      el.style.opacity = "1";
      el.style.transform = "translate3d(0,0,0)";
      window.setTimeout(() => {
        el.style.opacity = "";
        el.style.transform = "";
        el.style.transition = "";
        el.style.transitionDelay = "";
        el.style.willChange = "";
      }, 1000 + delay + 100);
    });
  };

  // Blur + rise reveal (same as the StatSection heading).
  const blurIn = (el: StyledEl | null, delay: number, trigger: Element) => {
    if (!el) return;
    el.style.opacity = "0";
    el.style.filter = "blur(14px)";
    el.style.transform = "translate3d(0,32px,0)";
    el.style.transition = "none";
    el.style.willChange = "opacity, filter, transform";
    void el.getBoundingClientRect();
    watch(trigger, () => {
      el.style.transition = T_BLUR;
      el.style.transitionDelay = `${delay}ms`;
      el.style.opacity = "1";
      el.style.filter = "blur(0px)";
      el.style.transform = "translate3d(0,0,0)";
      window.setTimeout(() => {
        el.style.opacity = "";
        el.style.filter = "";
        el.style.transform = "";
        el.style.transition = "";
        el.style.transitionDelay = "";
        el.style.willChange = "";
      }, 1100 + delay + 100);
    });
  };

  const q = (name: string) => main.querySelector<HTMLElement>(`[data-anim="${name}"]`);

  // 1) Top header: eyebrow + title from left, description from right (left when stacked)
  const eyebrow = q("eyebrow");
  slide(eyebrow, LEFT, 0, eyebrow?.parentElement);
  lineText(q("top-title"), LEFT, 100);
  lineText(q("top-desc"), RIGHT, 300);

  // 2) Benefits bar: icon -> heading -> description, staggered per benefit
  main.querySelectorAll<HTMLElement>("[data-benefit]").forEach((item, i) => {
    const base = stacked ? 0 : i * 150;
    blurIn(item.querySelector<HTMLElement>('[data-blur="icon"]'), base, item);
    blurIn(item.querySelector<HTMLElement>('[data-blur="title"]'), base + 120, item);
    blurIn(item.querySelector<HTMLElement>('[data-blur="desc"]'), base + 240, item);
  });
}

export default function ParticipatePage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] =
    useState<ParticipateModalType>(null);

  // Animations (runs once on mount)
  useIsoLayoutEffect(() => {
    startParticipateAnimations();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="Participate"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="Participate"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Eyebrow: Our Mission a little up */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <div data-anim="eyebrow" className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-[#FCCC2D]" />
            <Typography variant="body-8" as="span" className="font-manrope font-normal text-[#8F5E09]">
              Our Mission
            </Typography>
          </div>
        </div>

        {/* Equal Level Row: Title on Left, Paragraph on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-10 sm:mb-14 items-center">
          <div className="md:col-span-6 lg:col-span-8">
            <div data-anim="top-title" className="md:max-w-[21rem] lg:max-w-none">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838] lg:whitespace-nowrap"
              >
                Find Your Way to Make an Impact
              </Typography>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-4">
            <div data-anim="top-desc">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-[#596D79] text-left !leading-relaxed"
              >
                Your time, skills and support can bring hope to patients and families. Explore the different ways you can get involved with HCG Foundation.
              </Typography>
            </div>
          </div>
        </div>

        {/* 3-Column Vertical Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 mb-12 sm:mb-16">
          {PARTICIPATE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-t-[0.375rem] rounded-b-[0.25rem] bg-[#FFFCF3] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Image Asset */}
              <div className="w-full h-[15rem] sm:h-[16.25rem] md:h-[11rem] lg:h-[16.5rem] xl:h-[22.1875rem] overflow-hidden relative bg-[#EFEAD8]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Floating Circular Icon Badge matching Figma Frame 556 */}
              <div className="-mt-8 md:-mt-7 lg:-mt-10 ml-4 md:ml-4 lg:ml-6 relative z-10 size-16 md:size-14 lg:size-20 rounded-full bg-[#FFF3CC] flex items-center justify-center shrink-0 p-3 md:p-2.5 lg:p-4">
                <img
                  src={card.iconUrl}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Body: Title, Description, Apply Button (Rectangle 1663: #FFFCF3) */}
              <div className="p-5 md:p-3.5 lg:p-7 pt-2.5 md:pt-2 lg:pt-3 flex-1 flex flex-col justify-between bg-[#FFFCF3] rounded-b-[0.25rem]">
                <div>
                  <div className="mb-2 md:mb-1.5 lg:mb-3">
                    <Typography variant="heading-10" as="h2" className="font-argestadisplay font-normal text-[#0D2838]">
                      {card.title}
                    </Typography>
                  </div>
                  <div className="mb-4 md:mb-3 lg:mb-6">
                    <Typography variant="body-9" as="p" className="font-manrope font-normal text-[#6C6C6C]">
                      {card.description}
                    </Typography>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalType(card.id as ParticipateModalType)
                    }
                    className="inline-flex items-center justify-between w-[9.5rem] sm:w-[10.5rem] md:w-[8.5rem] lg:w-[11.6875rem] h-[2.5rem] md:h-[2.5rem] lg:h-[3.5625rem] pl-3.5 pr-2 py-1.5 md:pl-2.5 md:pr-1.5 lg:pl-[1.1025rem] lg:pr-[0.58rem] lg:py-[0.58rem] gap-2 lg:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span className="font-manrope font-semibold text-[0.875rem] sm:text-[1rem] md:text-[0.875rem] lg:text-[1.125rem] leading-[150%] tracking-[0.02em] text-[#2D2D2D]">
                      Apply Now
                    </span>
                    <img
                      src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849562451-vj014-vector-17-.webp"
                      alt=""
                      aria-hidden="true"
                      className="w-[1rem] h-[0.8rem] md:w-[0.9rem] md:h-[0.75rem] lg:w-[1.2925rem] lg:h-[1.034rem] object-contain shrink-0"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Benefits Banner matching Figma Frame 577: #FFF4CF, Radius 0.375rem, Padding Top 1.9375rem, Bottom 2.25rem, Left/Right 1.25rem */}
        <div className="bg-[#FFF4CF] rounded-[0.375rem] pt-[1.9375rem] pb-[2.25rem] px-5 sm:px-[1.25rem] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
          {PARTICIPATE_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              data-benefit
              className="flex items-center gap-3.5 sm:gap-4 lg:gap-[1.3rem]"
            >
              <div
                data-blur="icon"
                className="w-[3.25rem] h-[3.25rem] sm:w-[3.75rem] sm:h-[3.75rem] lg:w-[4.9225rem] lg:h-[4.9225rem] rounded-full border border-[#C2A947] flex items-center justify-center shrink-0 bg-[#FFF3CC]"
              >
                <img
                  src={benefit.iconUrl}
                  alt={benefit.title}
                  className="w-[1.625rem] h-[1.625rem] sm:w-[1.875rem] sm:h-[1.875rem] lg:w-[2.38375rem] lg:h-[2.38375rem] object-contain"
                />
              </div>
              <div className="text-left">
                <div data-blur="title" className="mb-0.5 sm:mb-1">
                  <Typography
                    variant="body-2"
                    as="h3"
                    className="font-argestadisplay font-normal text-left text-[#2C2C2C]"
                  >
                    {benefit.title}
                  </Typography>
                </div>
                <div data-blur="desc">
                  <Typography
                    variant="body-9"
                    as="p"
                    className="font-manrope font-normal text-left text-[#6C6C6C]"
                  >
                    {benefit.description}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Participate Application Modal (Intern, Fundraise, Volunteer) */}
      <ParticipateModal
        isOpen={!!activeModalType}
        type={activeModalType}
        onClose={() => setActiveModalType(null)}
      />

      {/* Partner With Us Popup Modal */}
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
