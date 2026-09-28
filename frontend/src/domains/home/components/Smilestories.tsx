"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  AUTO_SCROLL_SPEED,
  DRAG_THRESHOLD,
  RESUME_DELAY,
  SAVE_INTERVAL,
  STORAGE_KEY,
  wrap,
  stories as fallbackStories,
} from "@/domains/home/constants/smile";
import { motion } from "framer-motion";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

function formatStoryDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StoryCard({
  name,
  date,
  image,
  objectPosition,
  excerpt,
  onCardClick,
}: {
  name: string;
  date: string;
  image: string;
  objectPosition?: string;
  excerpt?: string;
  onCardClick?: (e: React.MouseEvent) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontContent = (
    <div className="group flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.2643rem] border-[0.0527rem] border-[rgba(255,255,255,0.55)] bg-[rgba(0,0,0,0.23)] backdrop-blur-[1.30625rem] pt-[1.4223rem] pl-[1.475rem] pr-[1.4223rem] pb-0">
      {/* photo: aspect 21.177rem / 23.021rem and 1.2643rem radius from Figma */}
      <div
        className="relative w-full aspect-[21.177/23.021] overflow-hidden rounded-[1.2643rem] bg-[#00000014]"
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 639px) clamp(240px, 65vw, 320px), (max-width: 767px) clamp(280px, 52vw - 34px, 360px), (max-width: 1023px) clamp(320px, 52vw - 42px, 400px), (max-width: 1279px) clamp(340px, 32vw - 20px, 430px), clamp(280px, 24vw - 6px, 460px)"
          style={{ objectPosition: objectPosition ?? "center" }}
          className="rounded-[1.2643rem] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* name / date, below the photo, inside the card */}
      <div
        className="h-[6.375rem] flex items-center justify-between cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onCardClick?.(e);
        }}
      >
        <div>
          <Typography
            variant="heading-8"
            as="p"
            className="text-left text-white font-semibold font-manrope"
          >
            {name}
          </Typography>
          <Typography
            variant="text-2"
            as="p"
            className="mt-1 flex items-center gap-2 text-white text-nowrap font-normal font-manrope"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
            {date}
          </Typography>
        </div>
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div className="relative h-full w-full flex flex-col justify-between items-center p-[1.425rem] rounded-[1.2643rem] border-[0.0527rem] border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2]">
        {/* Centered Excerpt with Proportional Body-2 */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center my-auto px-[0.5rem] w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={
              flipped
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 8 }
            }
            transition={{
              duration: flipped ? 0.38 : 0.15,
              delay: flipped ? 0.42 : 0,
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            <Typography
              variant="body-2"
              as="p"
              className="text-[#0D2838] max-w-md"
            >
              {excerpt || "Explore the journey of hope, courage, and recovery."}
            </Typography>
          </motion.div>
        </div>

        {/* Read More Button Constant at Bottom Center */}
        <motion.div
          className="relative z-10 w-full flex justify-center shrink-0 pt-[0.75rem]"
          initial={{ opacity: 0, y: 8 }}
          animate={
            flipped
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 8 }
          }
          transition={{
            duration: flipped ? 0.38 : 0.15,
            delay: flipped ? 0.46 : 0,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.(e);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[0.375rem] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </div>
        </motion.div>
      </div>
    </MirrorReveal>
  );

  return (
    <FlipCard
      className="aspect-[385/493] w-full rounded-[1.2643rem]"
      roundedClassName="rounded-[1.2643rem]"
      isFlipped={isFlipped}
      onFlipChange={setIsFlipped}
      onClick={onCardClick}
      flipOnHover={true}
      duration={0.42}
      front={frontContent}
      back={renderBackContent}
    />
  );
}

export default function SmileStories() {
  const [apiStories, setApiStories] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await publicPatientStoriesApi.listPublished({
          page: 1,
          limit: 12,
        });
        if (cancelled) return;
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((item) => ({
            name: item.title,
            date: formatStoryDate(item.storyDate),
            image: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
            link: `/journey-of-hope/patient-stories/${item.slug || item.id}`,
            excerpt: item.shortDescription || "",
          }));
          const fullStories = mapped.length < 4 ? [...mapped, ...mapped, ...mapped, ...mapped].slice(0, 8) : mapped;
          setApiStories(fullStories);
        } else {
          setApiStories(fallbackStories.map(s => ({ ...s, excerpt: "Explore the journey of hope, courage, and recovery." })));
        }
      } catch (err: any) {
        if (!cancelled) {
          setApiStories(fallbackStories.map(s => ({ ...s, excerpt: "Explore the journey of hope, courage, and recovery." })));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (apiStories === null) {
    return <div className="min-h-[400px]"></div>;
  }

  if (apiStories.length === 0) {
    return null;
  }

  return <SmileStoriesCarousel apiStories={apiStories} />;
}

function SmileStoriesCarousel({ apiStories }: { apiStories: any[] }) {
  const router = useRouter();
  const isInfinite = apiStories.length >= 4;
  const displayStories = isInfinite ? [...apiStories, ...apiStories, ...apiStories] : apiStories;

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
  const measureRafRef = useRef<number | null>(null);
  const clickedLinkRef = useRef<string | null>(null);

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
    if (!trackRef.current || !isInfinite) return;
    oneSetWidthRef.current = trackRef.current.scrollWidth / 3;
    offsetRef.current = wrap(offsetRef.current, oneSetWidthRef.current);
    applyTransform();
  };

  // Debounced measure: avoids layout thrash / jumpy transforms when the
  // ResizeObserver fires multiple times in a row (e.g. during a viewport
  // resize or an orientation change), which is what caused the visible
  // stutter on some screens.
  const scheduleMeasure = () => {
    if (measureRafRef.current) cancelAnimationFrame(measureRafRef.current);
    measureRafRef.current = requestAnimationFrame(() => {
      measureRafRef.current = null;
      measure();
    });
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
    const ro = new ResizeObserver(() => scheduleMeasure());
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      if (measureRafRef.current) cancelAnimationFrame(measureRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered || !isInfinite) return;

    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      // Clamp dt so a dropped/backgrounded frame (tab switch, slow device)
      // doesn't cause a big visible jump when the animation resumes - this
      // is what made the movement look "unsmooth" on some screens.
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
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
    if (!isInfinite) return;
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
    if (!isInfinite || pointerIdRef.current === null || oneSetWidthRef.current === 0) return;
    const dx = dragStartXRef.current - e.clientX;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return; // ignore tiny jitters / clicks
      isDraggingRef.current = true;
      didDragRef.current = true;
      clickedLinkRef.current = null;
    }

    offsetRef.current = wrap(dragStartOffsetRef.current + dx, oneSetWidthRef.current);
    applyTransform();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInfinite) return;
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
      if (clickedLinkRef.current) {
        saveOffset();
        router.push(clickedLinkRef.current);
        clickedLinkRef.current = null;
      }
    }
  };

  const handleCardClick = (link: string) => {
    if (isInfinite && didDragRef.current) return; // it was a drag, not a click - don't navigate
    if (isInfinite) saveOffset();
    router.push(link);
  };

  return (
    <section ref={sectionRef} className="relative w-full lg:py-20">
      <Typography
        id="smilestories"
        variant="heading-3"
        as="h2"
        className="mx-auto mb-14 text-center px-4 text-neutral-800 font-medium font-manrope pt-6 scroll-mt-24"
      >
        Behind Every <em className="text-neutral-900 font-tiempos-headline">Smile Is a Story</em>
      </Typography>

      <div
        ref={viewportRef}
        className={`mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 ${isInfinite ? 'overflow-hidden' : 'overflow-x-auto snap-x no-scrollbar'}`}
      >
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={() => {
            if (!isInfinite) return;
            isPausedRef.current = true;
            scheduleResume();
          }}
          className={`flex w-max flex-nowrap gap-3 sm:gap-5 lg:gap-8 ${
            isInfinite 
              ? 'touch-pan-y cursor-grab select-none will-change-transform active:cursor-grabbing' 
              : 'touch-pan-x snap-mandatory'
          }`}
        >
          {displayStories.map((story, i) => (
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
              onPointerDown={() => {
                clickedLinkRef.current = story.link;
              }}
              onClick={(e) => {
                e.preventDefault();
                handleCardClick(story.link);
              }}
            >
              <StoryCard
                {...story}
                onCardClick={() => handleCardClick(story.link)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}