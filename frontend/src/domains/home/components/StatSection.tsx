"use client";

import { useEffect, useRef, useState } from "react";
import { STATS, type Stat } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";

/* =========================================================
   RIBBON PATH
========================================================= */

const RIBBON_PATH =
  "M38 262 C100 172 172 108 142 46 C126 8 54 8 38 46 C8 108 80 172 142 262";

/* =========================================================
   REVERSE-U LOOP ONLY
========================================================= */

const LOOP_PATH = "M142 46 C126 8 54 8 38 46";

/* =========================================================
   NOTCHES
========================================================= */

const NOTCH_LEFT = "48,278 20,256 42,254";
const NOTCH_RIGHT = "160,258 128,276 138,253";

/* =========================================================
   RIBBON
========================================================= */

function Ribbon({ id, delay, active }: { id: string; delay: number; active: boolean }) {
  return (
    <svg viewBox="0 0 200 285" className="h-72 w-auto" aria-hidden="true">
      <defs>
        {/* =================================================
            MAIN RIBBON
        ================================================= */}

        <linearGradient id={`base-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDC61D" />
          <stop offset="100%" stopColor="#FDC61D" />
        </linearGradient>

        {/* =================================================
            ORIGINAL SHEEN COLOR

            This is the same color from your animated
            sheen:

            #FFE486

            But this version is STATIC.
        ================================================= */}

        <linearGradient
          id={`loop-glow-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="38"
          y1="8"
          x2="142"
          y2="46"
        >
          <stop offset="0%" stopColor="#FDC61D" />
          <stop offset="35%" stopColor="#FDC61D" />
          <stop offset="50%" stopColor="#FFE486" />
          <stop offset="65%" stopColor="#FDC61D" />
          <stop offset="100%" stopColor="#FDC61D" />
        </linearGradient>

        {/* =================================================
            SOFT GLOW FILTER

            Makes #FFE486 look luminous instead of like
            another solid ribbon.
        ================================================= */}

        <filter id={`loop-glow-filter-${id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* =================================================
            NOTCH MASK
        ================================================= */}

        <mask id={`notch-${id}`} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="200" height="285" fill="white" />
          <polygon points={NOTCH_LEFT} fill="black" />
          <polygon points={NOTCH_RIGHT} fill="black" />
        </mask>
      </defs>

      <g mask={`url(#notch-${id})`}>
        {/* =================================================
            1. SOFT STATIC GLOW BEHIND LOOP

            Uses the same #FFE486 sheen color.
            NO ANIMATION.
        ================================================= */}

        <path
          d={LOOP_PATH}
          fill="none"
          stroke="#FFE486"
          strokeWidth={36}
          strokeLinecap="butt"
          filter={`url(#loop-glow-filter-${id})`}
          style={{
            opacity: active ? 0.45 : 0,
            transition: `opacity 1s ease-out ${delay}s`,
          }}
        />

        {/* =================================================
            2. MAIN RIBBON

            Remains #FDC61D.
        ================================================= */}

        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#base-${id})`}
          strokeWidth={30}
          strokeLinecap="butt"
          style={{
            strokeDasharray: 800,
            strokeDashoffset: active ? 0 : 800,
            transition: `stroke-dashoffset 1.6s ease-out ${delay}s`,
          }}
        />

        <path
          d={LOOP_PATH}
          fill="none"
          stroke={`url(#loop-glow-${id})`}
          strokeWidth={30}
          strokeLinecap="butt"
          style={{
            opacity: active ? 1 : 0,
            transition: `opacity 0.8s ease-out ${delay}s`,
          }}
        />

        {/* =================================================
            4. VERY SOFT CENTER GLOW

            Adds the transparent glow around the
            #FFE486 sheen.
        ================================================= */}

        <path
          d={LOOP_PATH}
          fill="none"
          stroke="#FFE486"
          strokeWidth={20}
          strokeLinecap="butt"
          filter={`url(#loop-glow-filter-${id})`}
          style={{
            opacity: active ? 0.35 : 0,
            transition: `opacity 0.8s ease-out ${delay}s`,
          }}
        />

        <path d={RIBBON_PATH} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={31} strokeLinecap="butt" />
      </g>
    </svg>
  );
}

/* =========================================================
   COUNT UP
========================================================= */

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) {
      return;
    }

    started.current = true;

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return value;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ stat, active, id }: { stat: Stat; active: boolean; id: string }) {
  const count = useCountUp(stat.value, active);

  return (
    <div
      className="flex flex-col items-center transition-all duration-700"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${stat.delay}s`,
      }}
    >
      <div className="relative">
        <Ribbon id={id} delay={stat.delay} active={active} />

        <Typography
          variant="hero"
          as="span"
          className="pointer-events-none absolute left-1/3 top-[30%] -translate-x-1/5 -translate-y-1/2 whitespace-nowrap px-1 font-bold font-manrope tracking-tight text-stone-900 drop-shadow-sm"
        >
          {count.toLocaleString()}
          {stat.suffix}
        </Typography>
      </div>

      <Typography
        variant="body-lg"
        as="p"
        className="mt-2 whitespace-pre-line text-center font-tiempos-headline font-normal text-[#000000]"
      >
        {stat.label}
      </Typography>
    </div>
  );
}

export default function StatSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white px-6 py-6 lg:py-10">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FFE486 0%, #FFF6D8 100%)",
        }}
      />

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="relative mx-auto max-w-3xl text-center">
        <Typography variant="editorial-lg" as="h2" className="font-tiempos-headline text-black">
          Our Journey of Impact
        </Typography>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-[repeat(2,max-content)] md:justify-center md:gap-1 lg:grid-cols-4 lg:gap-10">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} active={active} id={`r${i}`} />
        ))}
      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <Typography
        variant="heading-center"
        as="p"
        className="relative mx-auto mt-14 max-w-2xl text-center font-argestadisplay text-stone-500"
      >
        Every number represents a life touched, a family supported, and a community strengthened{" "}
        <span className="text-black">through hope, compassion, and care.</span>
      </Typography>
    </section>
  );
}