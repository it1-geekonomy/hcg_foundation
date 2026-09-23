"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Stat } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";

export default function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const [reloadKey, setReloadKey] = useState(0);
  const wasActive = useRef(false);

  useEffect(() => {
    // Only bump the key on the false -> true transition, so the gif
    // restarts from frame 1 every time the card re-enters view
    // (scrolling down into it, or scrolling back up into it).
    if (active && !wasActive.current) {
      setReloadKey((k) => k + 1);
    }
    wasActive.current = active;
  }, [active]);

  return (
    <div
      className="flex flex-col items-center transition-all duration-700"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${stat.delay}s`,
      }}
    >
      <div className="relative h-56 w-[202px] lg:h-64">
        {active && (
          <Image
            key={reloadKey}
            src={`${stat.gif}?r=${reloadKey}`}
            alt={stat.label.replace("\n", " ")}
            fill
            unoptimized
            className="object-contain"
          />
        )}
      </div>

      <Typography
        variant="body-4"
        as="p"
        className="whitespace-pre-line text-center text-black font-light"
      >
        {stat.label}
      </Typography>
    </div>
  );
}