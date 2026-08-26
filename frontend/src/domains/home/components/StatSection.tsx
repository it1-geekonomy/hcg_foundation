"use client";

import { useEffect, useRef, useState } from "react";
import { STATS } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import StatCard from "./Statcard";

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