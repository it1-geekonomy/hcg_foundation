"use client";

import Image from "next/image";
import { useState } from "react";

/** Put the woman/mother-daughter photo at: public/formimage.png */

const AMOUNTS = ["₹3000", "₹5,000", "₹10,000", "₹15,000", "₹25,000"];

const IMPACT_ITEMS = [
  {
    emoji: "🏥",
    title: "Support Treatment",
    desc: "Help fund critical cancer treatments",
  },
  {
    emoji: "🤝",
    title: "Care & Compassion",
    desc: "Provide emotional and holistic care",
  },
  {
    emoji: "💰",
    title: "Financial Assistance",
    desc: "Offer financial aid to families in need",
  },
  {
    emoji: "❤️",
    title: "Hope & Recovery",
    desc: "Bring hope and strength for tomorrow",
  },
];

const TRUST_ITEMS = [
  {
    icon: "🛡️",
    title: "80G Tax Exemption",
    desc: "Get tax benefits on your donation",
  },
  {
    icon: "📋",
    title: "100% Transparent",
    desc: "Your donation goes directly to those in need",
  },
  {
    icon: "✅",
    title: "Trusted & Verified",
    desc: "HCG Foundation is a trusted organisation",
  },
  {
    icon: "💛",
    title: "Lives Impacted",
    desc: "Your support helps thousands of lives",
  },
];

export default function OverlayForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState("₹3000");

  return (
    <DonationModal
      selectedAmount={selectedAmount}
      onSelectAmount={setSelectedAmount}
      onClose={onClose}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Donation modal                                                      */
/* ------------------------------------------------------------------ */

function DonationModal({
  selectedAmount,
  onSelectAmount,
  onClose,
}: {
  selectedAmount: string;
  onSelectAmount: (amount: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-white/10 backdrop-blur-sm py-6 lg:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-modal-title"
    >
      {/*
        ============================================================
        GRADIENT #1 — MAIN BACKGROUND GRADIENT (the big one)
        Spans the ENTIRE modal (both panels), diagonal, white → gold.
        This is the primary source of all the yellow/gold color you see.
        Stops pushed later (52/74/92) so white dominates even longer
        and gold is now confined closer to the bottom-right corner.
        ============================================================
      */}
      <div
        className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:mx-0 lg:my-auto lg:max-h-[860px] lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch xl:inset-16"
        style={{
          background:
            "linear-gradient(115deg, #ffffff 0%, #ffffff 52%, #FCE9AE 74%, #F9BF16 92%, #C89100 100%)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close donation form"
          className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center bg-black text-[#F9BF16] transition"
        >
          ✕
        </button>

        {/*
          ============================================================
          GRADIENT #2 — FORM PANEL RIGHT-EDGE MASK
          Not a color gradient — a transparency mask on the white form
          panel. It keeps the form 100% opaque white up to 85% of its
          width, then fades to transparent in the last 15%, letting
          GRADIENT #1 show through only in that thin edge strip.
          ============================================================
        */}
        <div
          className="relative flex w-full min-w-0 flex-col justify-center bg-white px-8 py-6 lg:w-1/2 lg:min-h-0 lg:justify-start lg:overflow-y-auto lg:px-12 lg:py-8"
          style={{
            maskImage:
              "linear-gradient(to right, black 0%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 85%, transparent 100%)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Together, we can
          </p>

          <h2
            id="donation-modal-title"
            className="mt-4 font-serif text-4xl leading-tight text-gray-900"
          >
            <span className="italic">Bring Hope</span>
            <br />
            {/* GRADIENT #3 — "Beyond Cancer" text fill gradient (Tailwind). Small, decorative, on the heading text only — not part of the background wash. Left unchanged. */}
            <span className="italic bg-gradient-to-r from-[#F9BF16] to-[#B98A00] bg-clip-text text-transparent">Beyond Cancer</span>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-500">
            Your contribution helps provide life-saving treatment, emotional
            care, and financial support to cancer patients and their
            families in need.
          </p>

          {/* Impact grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {IMPACT_ITEMS.map((item) => (
              <div key={item.title} className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9BF16]/10 text-lg">
                  {item.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs leading-snug text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Amount selector and CTA share the same width on desktop. */}
          <div className="mt-10 w-full lg:w-fit">
            <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Choose an amount
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AMOUNTS.map((amount) => {
                const active = amount === selectedAmount;
                return (
                  <button
                    key={amount}
                    onClick={() => onSelectAmount(amount)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    {amount}
                  </button>
                );
              })}
              <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
                More
              </button>
            </div>
            </div>

          {/* Donate CTA matches the amount row width at 1024px and above. */}
          <button className="mt-8 flex w-fit items-center justify-center gap-2 self-start rounded-xl bg-[#FDC61D] px-10 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#E9B510] lg:w-full lg:self-auto lg:px-0 lg:py-3.5">
            ❤️ DONATE NOW →
          </button>
          <p className="mt-2 text-left lg:text-center text-xs text-gray-400">
            🔒 Secure Payment | Powered by Razorpay
          </p>
          </div>

          {/* Trust row */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex min-w-0 flex-col gap-1">
                <span className="text-base">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-[11px] leading-snug text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*
          ============================================================
          GRADIENT #4 — PHOTO EDGE MASK (left fade + top-left radial)
          FIXED: previously used a fixed 480px radial circle, which at
          `lg` panel widths (~500-650px) covered nearly the whole photo
          instead of just the corner — that's why gold was flooding
          across the top of the image instead of staying a thin edge
          blend.

          Now uses:
            a) linear: photo stays fully opaque up to 96% of its width
               (was 92%), so only a thin 4% sliver on the left blends
               into Gradient #1.
            b) radial: circle sized as 22% of the box's own diagonal
               (`farthest-corner`, no fixed px), so the corner-soften
               behind the close button scales correctly at every
               breakpoint instead of overwhelming smaller panels.
          Combined with "intersect", so a pixel is only masked out if
          BOTH conditions call for it — keeping the effect subtle.
          ============================================================
        */}
        <div className="relative -mt-px w-full shrink-0 lg:mt-0 lg:h-full lg:w-1/2">
          <div className="relative h-[220px] w-full sm:h-[240px] md:h-[260px] lg:aspect-auto lg:h-full">
            <Image
              src="/formimage.png"
              alt="Cancer patient and her daughter embracing, both smiling"
              fill
              sizes="(min-width: 1024px) 50vw, 50vw"
              className="object-cover object-top"
              style={{
                maskImage:
                  "linear-gradient(to left, black 96%, transparent 100%), radial-gradient(circle at top left, transparent 0%, black 22%)",
                maskComposite: "intersect",
                WebkitMaskImage:
                  "linear-gradient(to left, black 96%, transparent 100%), radial-gradient(circle at top left, transparent 0%, black 22%)",
                WebkitMaskComposite: "source-in",
              }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}