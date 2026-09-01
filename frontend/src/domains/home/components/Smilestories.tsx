"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  AUTO_SCROLL_SPEED,
  DRAG_THRESHOLD,
  loopedStories,
  RESUME_DELAY,
  SAVE_INTERVAL,
  STORAGE_KEY,
  wrap,
} from "@/domains/home/constants/smile";

function StoryCard({
  name,
  date,
  image,
}: {
  name: string;
  date: string;
  image: string;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#8D8D8D66] p-6 shadow-2xl backdrop-blur-xl">
      {/* photo, inset inside the glass card */}
      <div className="relative aspect-[8/9] w-full overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 639px) clamp(240px, 65vw, 320px), (max-width: 767px) clamp(280px, 52vw - 34px, 360px), (max-width: 1023px) clamp(320px, 52vw - 42px, 400px), (max-width: 1279px) clamp(340px, 32vw - 20px, 430px), clamp(280px, 24vw - 6px, 460px)"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* name / date / arrow, below the photo, inside the card */}
      <div className="flex items-center justify-between gap-2 pt-4">
        <div>
          <Typography variant="heading-8" as="p" className="text-left text-white font-semibold font-manrope">
            {name}
          </Typography>
          <Typography variant="text-2"
            as="p"
            className="mt-1 flex items-center gap-2 text-white text-nowrap font-normal font-manrope"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
            {date}
          </Typography>
        </div>
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF] group-hover:bg-white/70">
          <Image
            src="/Smilestories/Vector.png"
            alt="View story"
            width={14}
            height={14}
          />
        </span>
      </div>
    </div>
  );
}

export default function SmileStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [hasEntered, setHasEntered] = useState(false);

  const offsetRef = useRef(0); // kept wrapped inside [0, oneSetWidth)
  const oneSetWidthRef = useRef(0);

  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false); // true if the current pointer gesture moved past the threshold
  const isPausedRef = useRef(false); // paused by drag/click/wheel interaction
  const isHoverPausedRef = useRef(false); // paused by hovering a card
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const lastSaveTsRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const applyTransform = () => {
    if (!trackRef.current) return;
    const shift = offsetRef.current + oneSetWidthRef.current;
    trackRef.current.style.transform = `translate3d(-${shift}px, 0, 0)`;
  };

  const saveOffset = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(offsetRef.current));
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) - ignore
    }
  };

  const measure = () => {
    if (!trackRef.current) return;
    oneSetWidthRef.current = trackRef.current.scrollWidth / 3;
    offsetRef.current = wrap(offsetRef.current, oneSetWidthRef.current);
    applyTransform();
  };

  // Restore last scroll position (e.g. user clicked a card, then hit back)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed)) {
          offsetRef.current = parsed;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist offset when the user navigates away or closes the tab
  useEffect(() => {
    const handleSave = () => saveOffset();
    window.addEventListener("pagehide", handleSave);
    window.addEventListener("beforeunload", handleSave);
    return () => {
      window.removeEventListener("pagehide", handleSave);
      window.removeEventListener("beforeunload", handleSave);
      saveOffset(); // also save on unmount (e.g. SPA route change)
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered) return;

    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const shouldMove =
        !isDraggingRef.current &&
        !isPausedRef.current &&
        !isHoverPausedRef.current &&
        oneSetWidthRef.current > 0;

      if (shouldMove) {
        offsetRef.current = wrap(
          offsetRef.current + AUTO_SCROLL_SPEED * dt,
          oneSetWidthRef.current
        );
        applyTransform();

        // periodically persist so a hard refresh / crash doesn't lose position
        if (ts - lastSaveTsRef.current > SAVE_INTERVAL) {
          lastSaveTsRef.current = ts;
          saveOffset();
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [hasEntered]);

  const clearResumeTimer = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const scheduleResume = () => {
    clearResumeTimer();
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, RESUME_DELAY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPausedRef.current = true;
    didDragRef.current = false;
    clearResumeTimer();
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    pointerIdRef.current = e.pointerId;
    // capture on the track itself (currentTarget), not whatever child was tapped
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === null || oneSetWidthRef.current === 0) return;
    const dx = dragStartXRef.current - e.clientX;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return; // ignore tiny jitters / clicks
      isDraggingRef.current = true;
      didDragRef.current = true;
    }

    offsetRef.current = wrap(dragStartOffsetRef.current + dx, oneSetWidthRef.current);
    applyTransform();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {
        // ignore if already released
      }
    }
    pointerIdRef.current = null;
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (wasDragging) {
      // real drag - give the user a moment before auto-scroll kicks back in
      scheduleResume();
    } else {
      // simple click/tap - resume immediately, no delay
      clearResumeTimer();
      isPausedRef.current = false;
    }
  };

  const handleCardClick = (link: string) => {
    if (didDragRef.current) return; // it was a drag, not a click - don't navigate
    saveOffset();
    window.location.href = "/#";
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-6 md:py-10 lg:py-20"
    >
      <Typography variant="heading-3"
        as="h2"
        className="mx-auto mb-14 text-center px-4 text-neutral-800 font-medium font-manrope"
      >
        Behind Every <em className="text-neutral-900 font-tiempos-headline">Smile Is a Story</em>
      </Typography>

      <div
        ref={viewportRef}
        className="mx-auto w-full overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12"
      >
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={() => {
            isPausedRef.current = true;
            scheduleResume();
          }}
          className="flex w-max touch-pan-y cursor-grab flex-nowrap gap-3 select-none active:cursor-grabbing sm:gap-5 lg:gap-8"
        >
          {loopedStories.map((story, i) => (
            <div
              key={`${story.name}-${i}`}
              className="shrink-0 basis-[clamp(240px,65vw,320px)] cursor-pointer sm:basis-[clamp(280px,52vw-34px,360px)] md:basis-[clamp(320px,52vw-42px,400px)] lg:basis-[clamp(340px,32vw-20px,430px)] xl:basis-[clamp(280px,24vw-6px,460px)]"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") {
                  isHoverPausedRef.current = true;
                }
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") {
                  isHoverPausedRef.current = false;
                }
              }}
              onDragStart={(e) => e.preventDefault()}
              onClick={() => handleCardClick(story.link)}
            >
              <StoryCard {...story} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}