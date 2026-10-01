"use client";

import React, {
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { PanInfo } from "framer-motion";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import TestimonialCard from "@/domains/journey-of-hope/components/TestimonialCard";
import TestimonialControls from "@/domains/journey-of-hope/components/TestimonialControls";
import TestimonialVideoModal from "@/domains/journey-of-hope/components/TestimonialVideoModal";
import { publicPatientTestimonialsApi } from "@/domains/cms/lib/api";
import { PlayCircle } from "lucide-react";
import ContentNotice, { LOAD_ERROR_MESSAGE } from "@/shared/components/ContentNotice";

const CONTAINER =
  "max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8";

/* Slide-in from the left. Plays once when it scrolls into view. */
function SlideInLeft({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    obs.observe(node);

    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-x-clip motion-reduce:!transition-none ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translate3d(0,0,0)"
          : "translate3d(-80px,0,0)",
        transition:
          "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

type CardItem = {
  id: string;
  patientName: string;
  role: string;
  thumbnailUrl: string;
  videoUrl: string;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setFailed(false);

      try {
        const res = await publicPatientTestimonialsApi.listPublished({
          limit: 50,
        });

        if (!cancelled && res.data) {
          const items: CardItem[] = res.data.map((t) => ({
            id: t.id,
            patientName: t.title,
            role: t.shortDescription || "Patient",
            thumbnailUrl: t.patientTestimonialBanner || "",
            videoUrl: t.patientTestimonialFile || "",
          }));

          setTestimonials(items);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const handleNext = () => {
    if (testimonials.length === 0) return;

    setCurrentIndex(
      (prev) => (prev + 1) % testimonials.length,
    );
  };

  const handlePrev = () => {
    if (testimonials.length === 0) return;

    setCurrentIndex(
      (prev) =>
        (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = 25;

    if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -150
    ) {
      handleNext();
    } else if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > 150
    ) {
      handlePrev();
    }
  };

  const getRelativeOffset = (index: number) => {
    const total = testimonials.length;

    if (total === 0) return 0;

    let diff = index - currentIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope overflow-x-hidden">
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Testimonials"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journey of Hope" },
        ]}
        title="Patient Testimonials"
      />

      {/* Main Section */}
      <section
        className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}
      >
        {/* Header Title & Subtitle */}
        <div className="w-full text-left">
          {/* Heading Animation */}
          <SlideInLeft>
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              Patient Testimonials
            </Typography>
          </SlideInLeft>

          {/* Description Animation */}
          <SlideInLeft
            delay={150}
            className="mt-3 sm:mt-4 max-w-full md:max-w-[51.25rem] lg:max-w-[86.25rem]"
          >
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              Every journey is filled with courage, compassion, and
              resilience. Explore inspiring patient stories, community
              initiatives, and life-changing moments that reflect HCG
              Foundation&apos;s commitment to bringing hope, healing, and
              support to those who need it most.
            </Typography>
          </SlideInLeft>
        </div>

        {!loading && failed ? (
          <ContentNotice
            tone="error"
            title="We couldn't load testimonials right now"
            message={LOAD_ERROR_MESSAGE}
            action={{ label: "Try again", onClick: () => setAttempt((n) => n + 1) }}
            headingAs="h3"
            className="mt-8 py-10 sm:mt-12"
          />
        ) : !loading && testimonials.length === 0 ? (
          <ContentNotice
            icon={PlayCircle}
            title="Patient testimonials are coming soon"
            message="We're recording the voices of patients and families whose journeys we've been part of. Please check back soon to hear their stories."
            headingAs="h3"
            className="mt-8 py-10 sm:mt-12"
          />
        ) : (
        /* Horizontal 3D Carousel */
        <div className="relative mt-8 sm:mt-12 w-full h-[16rem] sm:h-[18.5rem] lg:h-[16.5rem] xl:h-[19.5rem] 2xl:h-[22.5rem] overflow-visible flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse flex gap-4 w-full justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[30%] h-64 bg-black/10 rounded-xl"
                />
              ))}
            </div>
          ) : (
            testimonials.map((item, idx) => (
              <TestimonialCard
                key={item.id}
                item={item as any}
                diff={getRelativeOffset(idx)}
                windowWidth={windowWidth}
                onDragEnd={handleDragEnd}
                onNext={handleNext}
                onPrev={handlePrev}
                onPlayVideo={(url) => setActiveVideoUrl(url)}
              />
            ))
          )}
        </div>
        )}

        {/* Controls */}
        {testimonials.length > 0 && (
          <TestimonialControls
            currentIndex={currentIndex}
            total={testimonials.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelect={setCurrentIndex}
          />
        )}
      </section>

      {/* Video Modal */}
      <TestimonialVideoModal
        videoUrl={activeVideoUrl}
        onClose={() => setActiveVideoUrl(null)}
      />

      {/* Donate Section */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
