"use client";

import { useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";
import { stats } from "@/domains/about/constants/stats";

export interface StatsHighlightProps {
  /** Override the section background color/class if needed */
  className?: string;
}

/** Parses a stat value like "$1,200+", "98%", "3.5M" into prefix/number/suffix parts */
function parseStatValue(raw: string) {
  const match = String(raw).match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  if (!match) return { prefix: "", target: 0, suffix: raw, decimals: 0, hasComma: false };

  const [, prefix, numberStr, suffix] = match;
  const hasComma = numberStr.includes(",");
  const cleanNumber = numberStr.replace(/,/g, "");
  const decimals = cleanNumber.includes(".") ? cleanNumber.split(".")[1].length : 0;

  return {
    prefix,
    target: parseFloat(cleanNumber),
    suffix,
    decimals,
    hasComma,
  };
}

function formatStatValue(
  current: number,
  { prefix, suffix, decimals, hasComma }: Omit<ReturnType<typeof parseStatValue>, "target">
) {
  const fixed = current.toFixed(decimals);
  const formatted = hasComma
    ? Number(fixed).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : fixed;
  return `${prefix}${formatted}${suffix}`;
}

/** Animates a stat value counting up from 0 once `animate` becomes true */
function useCountUp(rawValue: string, animate: boolean, duration = 1500) {
  const [display, setDisplay] = useState(() => {
    const parsed = parseStatValue(rawValue);
    return formatStatValue(0, parsed);
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!animate || startedRef.current) return;
    startedRef.current = true;

    const parsed = parseStatValue(rawValue);
    const start = performance.now();

    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatStatValue(parsed.target * eased, parsed));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, rawValue, duration]);

  return display;
}

/**
 * Stats strip (About Us impact numbers).
 * Values/labels are sourced from `@/data/stats` rather than props.
 */
export default function StatsHighlight({ className = "" }: StatsHighlightProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pb-8 pt-0 lg:pt-0 lg:pb-14 xl:pb-20 px-8 sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:pl-40 2xl:pr-40 min-[1536px]:max-[1800px]:!pr-16 ${className}`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const animatedValue = useCountUp(stat.value, animate);

          return (
            <div
              key={index}
              className={`relative min-w-0 text-center lg:text-left lg:pl-10 lg:pr-10 xl:pl-12 xl:pr-12 2xl:pl-14 2xl:pr-14 lg:first:pl-0 lg:last:pr-0 ${
                index === 2 ? "min-[1536px]:max-[1800px]:!pr-4" : ""
              }`}
            >
              {/* Divider (fades top/bottom), hidden before the first item and below lg */}
              {index !== 0 && (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 hidden h-full w-px lg:block bg-[linear-gradient(180deg,rgba(51,51,51,0)_0%,rgba(26,26,26,0.15)_50%,rgba(0,0,0,0.08)_100%)]"
                />
              )}

              {/* Value: default variant everywhere except lg, where it's hidden */}
              <Typography
                variant="display-2"
                as="p"
                className="lg:hidden xl:block font-manrope font-medium bg-[linear-gradient(90deg,#F8AC02_0%,#CD9E01_100%)] bg-clip-text text-transparent"
              >
                {animatedValue}
              </Typography>
              {/* Value: heading-1 variant, shown only at lg */}
              <Typography
                variant="heading-3"
                as="p"
                className="hidden lg:block xl:hidden font-manrope font-medium bg-[linear-gradient(90deg,#F8AC02_0%,#CD9E01_100%)] bg-clip-text text-transparent"
              >
                {animatedValue}
              </Typography>

              {/* Description: default variant everywhere except lg, where it's hidden */}
              <Typography
                variant="body-2"
                as="p"
                className="lg:hidden xl:block mt-2 font-normal font-argestadisplay text-[#8F8F8F]"
              >
                {stat.label}
              </Typography>
              {/* Description: body-7 variant, shown only at lg */}
              <Typography
                variant="body-6"
                as="p"
                className="hidden lg:block xl:hidden mt-2 font-normal font-argestadisplay text-[#8F8F8F]"
              >
                {stat.label}
              </Typography>
            </div>
          );
        })}
      </div>
    </section>
  );
}