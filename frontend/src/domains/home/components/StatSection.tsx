"use client";

import { useEffect, useRef, useState } from "react";
import { STATS } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import StatCard from "./Statcard";

const DESC_TEXT =
  "Every number represents a life touched, a family supported, and a community strengthened through hope, compassion, and care.";

export default function StatSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  // Start the stat gifs once, the first time the section enters view.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 pt-2 lg:pt-2 lg:pb-2">
      <div className="relative max-w-full text-center">
        <Typography variant="heading-1" as="h2" className="text-[#382E07]">
          Our Journey of Impact
        </Typography>
      </div>

      <div className="relative mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-[repeat(2,max-content)] md:justify-center md:gap-1 lg:mt-6 lg:grid-cols-4 lg:gap-10">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} active={active} />
        ))}
      </div>

      <div className="relative mx-auto mt-14 max-w-4xl">
        <Typography variant="body-1" as="p" className="relative text-black">
          {DESC_TEXT}
        </Typography>
      </div>
    </section>
  );
}