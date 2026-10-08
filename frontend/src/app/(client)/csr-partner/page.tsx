"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { CSR_PARTNER_CARDS } from "@/domains/getinvolved/constants/csr-partner";
import PartnerLogosMarquee from "@/domains/getinvolved/components/PartnerLogosMarquee";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { cn } from "@/lib/utils";

const CONTAINER = "max-w-[70rem] xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ */
/* Slide-in animations                                                 */
/*  - Top header:      title from left, description from right        */
/*  - Contact strip:   everything from left (all screens)             */
/*  - Bottom banner:   title from left, description + CTA from right   */
/*  When the layout stacks (below md / 768px) everything is from left. */
/* ------------------------------------------------------------------ */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StyledEl = HTMLElement | SVGElement;

function startCsrAnimations(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const main = document.querySelector<HTMLElement>("main");
  if (!main || main.dataset.csrAnim) return;
  main.dataset.csrAnim = "1";
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

  // 2) Contact strip: everything from left on every screen
  const strip = q("contact");
  if (strip) {
    slide(q("contact-bar"), LEFT, 0, strip);
    slide(q("contact-label"), LEFT, 100, strip); // icon + "Contact Us :"
    lineText(q("contact-details"), LEFT, 200); // email + phone
  }

  // 3) Bottom banner: title from left, description + CTA from right (left when stacked)
  lineText(q("bottom-title"), LEFT, 0);

  let resolveDesc: () => void = () => { };
  const descDone = new Promise<void>((r) => {
    resolveDesc = r;
  });
  lineText(q("bottom-desc"), RIGHT, 150, resolveDesc);
  // CTA slides in quickly right after the description settles
  slide(q("bottom-cta"), RIGHT, 0, q("bottom-desc"), descDone, T_CTA, 600);
}

export default function CsrPartnerPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!(e.target as HTMLElement).closest?.("[data-csr-card]")) {
        setActiveCardId(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  // Slide-in animations (runs once on mount)
  useIsoLayoutEffect(() => {
    startCsrAnimations();
  }, []);

  const handleCardClick = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      {/* Top Hero Banner (Commented out) */}
      {/*
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="CSR Partner"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="CSR Partner"
      />
      */}

      <section className={`${CONTAINER} pt-7 sm:pt-[5rem] lg:pt-[6.5rem] xl:pt-[7rem] 2xl:pt-[7.5rem] pb-8 sm:pb-12 lg:pb-16`}>
        {/* Top Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem] items-start mb-8 sm:mb-10 lg:mb-12">
          <div data-anim="top-title">
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              Different Ways To Partner with HCG Foundation
            </Typography>
          </div>
          <div className="flex justify-start lg:justify-end">
            <div data-anim="top-desc" className="w-full lg:max-w-[45.5rem]">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-left text-[#596D79] !leading-relaxed"
              >
                Corporate can partner with HCG Foundation to make your CSR investment count where it matters most. We have a wide range of partnership options for you to choose from; all of which are customizable to meet your CSR goals.
              </Typography>
            </div>
          </div>
        </div>

        {/* CSR Partner Logos Infinite Moving Marquee (Above Cards Grid) */}
        <PartnerLogosMarquee />

        {/* 2-Column Cards Grid matching Figma (2 columns from 768px+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-4.5 2xl:gap-5">
          {CSR_PARTNER_CARDS.map((card) => {
            const isActive = activeCardId === card.id;

            return (
              <div
                key={card.id}
                data-csr-card
                onClick={() => handleCardClick(card.id)}
                className="relative group cursor-pointer select-none h-full"
              >
                {/* Underneath Stacked Card Sheet (Pops out to bottom-right on hover or active tap) */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 rounded-[0.27rem] border border-[#FFDF7C]/70 bg-[#F5ECCB]/80 transition-all duration-500 ease-out pointer-events-none",
                    isActive
                      ? "translate-x-2 translate-y-2 opacity-100"
                      : "translate-x-0 translate-y-0 opacity-0 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:opacity-100"
                  )}
                />

                {/* Main Card (Lifts to top-left on hover or active tap) */}
                <div
                  className={cn(
                    "relative z-10 rounded-[0.27rem] border border-[#FFDF7C] bg-[#FDF7EB] p-3.5 sm:p-4 md:p-4 lg:py-2.5 lg:px-4 xl:py-3 xl:px-4.5 2xl:py-3.5 2xl:px-5 flex flex-col justify-start h-full min-h-0 transition-all duration-500 ease-out",
                    isActive
                      ? "-translate-x-1 -translate-y-1 shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                      : "group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                  )}
                >
                  {/* Card Number & Title in One Line */}
                  <div className="flex items-baseline gap-2 sm:gap-2.5 mb-2 text-left">
                    <Typography
                      variant="heading-9"
                      as="span"
                      className="font-argestadisplay font-normal text-[#596D79] shrink-0"
                    >
                      {card.number.replace(/^0+/, "")}.
                    </Typography>
                    <Typography
                      variant="heading-9"
                      as="h2"
                      className="font-argestadisplay font-normal text-[#0D2838] break-words"
                    >
                      {card.title}
                    </Typography>
                  </div>

                  {/* Card Description */}
                  <div className="text-left">
                    <Typography
                      variant="body-11"
                      as="p"
                      className="font-argestadisplay font-normal text-left text-[#596D79] !leading-relaxed break-words"
                    >
                      {card.description}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Info Strip: yellow bar at left edge of container, info centered */}
        <div
          data-anim="contact"
          className="relative mt-[2rem] sm:mt-[2.5rem] w-full flex items-center justify-center min-h-[3.5rem]"
        >
          {/* Yellow line at the left edge of the container */}
          <div
            data-anim="contact-bar"
            className="absolute left-0 top-0 bottom-0 w-[0.25rem] bg-[#FCCC2D] shrink-0"
          />

          {/* Centered Contact Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-[0.5rem] sm:gap-[2rem] text-center sm:text-left">
            <div
              data-anim="contact-label"
              className="flex items-center justify-center sm:flex-col sm:items-center sm:justify-center gap-[0.5rem] sm:gap-0 shrink-0"
            >
              <Image
                src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849990827-u27ma-fa7-solid_contact-book.webp"
                alt="Contact"
                width={23}
                height={24}
                className="w-[1.40625rem] h-[1.5rem] object-contain"
              />
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#0D2838]"
              >
                Contact Us :
              </Typography>
            </div>
            <div data-anim="contact-details" className="flex flex-col text-center sm:text-left min-w-0">
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79]"
              >
                hcgfoundation@gmail.com
              </Typography>
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79]"
              >
                +91 8046607760
              </Typography>
            </div>
          </div>
        </div>

        {/* Bottom Impact Banner matching Figma Frame 576 */}
        <div className="mt-[2.5rem] sm:mt-[3.5rem] rounded-[0.25rem] bg-[#FFF4CF] p-[1.25rem] sm:pt-[1.1875rem] sm:pb-[1.6875rem] sm:px-[2rem] md:px-[2rem] lg:px-[2rem] flex flex-col md:flex-row md:items-start md:justify-between gap-[1.5rem] md:gap-[1.5rem]">
          <div data-anim="bottom-title" className="shrink-0">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838] leading-tight"
            >
              <span className="inline md:block">Together, We Can Create </span>
              <span className="inline md:block">Greater Impact</span>
            </Typography>
          </div>
          <div className="w-full flex-1 flex flex-col items-start gap-[0.625rem] md:max-w-[45rem]">

            <div data-anim="bottom-desc" className="w-full">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-left text-[#121212]"
              >
                Your organisation can help strengthen cancer care, support communities, and bring meaningful change to those who need it most.
              </Typography>
            </div>
            <button
              type="button"
              data-anim="bottom-cta"
              onClick={() => setIsPartnerModalOpen(true)}
              className="self-center md:self-start w-auto min-w-[11rem] px-5 sm:px-6 lg:px-6 h-[2.75rem] sm:h-[3.25rem] lg:h-[3.5625rem] inline-flex items-center justify-center gap-2 sm:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[2.625rem] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Typography
                variant="button-3"
                as="span"
                className="font-manrope font-semibold text-[#2D2D2D] whitespace-nowrap"
              >
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[0.8rem] h-[0.7rem] sm:w-[1rem] sm:h-[0.825rem] shrink-0 text-[#2D2D2D]" />
            </button>
          </div>
        </div>
      </section>

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
