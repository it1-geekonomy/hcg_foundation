"use client";

import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";

const ART_GALLERY_CARDS = [
  {
    icon: "/Resources/fi_1756784.png",
    title: "Showcase Art",
    description: "Exhibiting quality art pieces from emerging and established artists.",
  },
  {
    icon: "/Resources/Vector (8).png",
    title: "Create Awareness",
    description: "Using art as a medium to spread positivity and hope within the hospital community.",
  },
  {
    icon: "/Resources/Vector (9).png",
    title: "Support a Cause",
    description: "All proceeds help support cancer patients and Foundation initiatives.",
  },
  {
    icon: "/Resources/Vector (10).png",
    title: "Encourage Talent",
    description: "A platform for both up-and-coming and senior artists from across India and abroad.",
  },
];

const PARAGRAPH_CLASS = "font-argestadisplay font-normal text-left text-[#596D79]";
const SUBHEADING_CLASS = "font-argestadisplay font-normal text-[#262626]";
const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------- card reveal animation (staggered fade-up, plays once) ------------- */

const CARD_STEP_MS = 200;
const CARD_TRANSITION =
  "opacity 700ms ease-out, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";

function cardStyle(visible: boolean, index: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(0,30px,0)",
    transition: CARD_TRANSITION,
    transitionDelay: `${index * CARD_STEP_MS}ms`,
    willChange: "opacity, transform",
  };
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
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
      { threshold },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ---------------------------- section ---------------------------- */

export default function SwasthiArtTherapySection() {
  const { ref: boxRef, visible: cardsVisible } = useInViewOnce<HTMLDivElement>(0.15);

  return (
    <section className="overflow-x-hidden bg-[#FFF8E2]">
      <div className={`${CONTAINER} py-2 sm:py-4 lg:py-6 flex flex-col space-y-[2rem] sm:space-y-[2.5rem]`}>
        {/* Title, then intro paragraph */}
        <div className="flex flex-col gap-[2rem] sm:gap-[2.5rem]">
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Swasti Art Gallery & Art Therapy Program
          </Typography>

          <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
            Swasti Art Gallery is HCG Foundation&apos;s creative care initiative where art supports patients through their cancer journey. Located within HCG&apos;s headquarters at Tower 1, Bengaluru, Swasti Gallery brings together two connected efforts: a contemporary art gallery that channels the power of art into funding cancer care, and a dedicated Art Therapy program that brings the healing process of art making directly to patients.
          </Typography>
        </div>

        {/* About Swasthi Gallery: heading, then its 2 paragraphs */}
        <div className="flex flex-col">
          <Typography variant="heading-8" as="h3" className={SUBHEADING_CLASS}>
            About Swasti Gallery
          </Typography>

          <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
            Launched in 2007, the art space in a hospital gives a positive energy to the patients and their families. Swasti Art Gallery has been actively involved in organizing art shows, camps and workshops which involve artists coming from across the country and outside.
          </Typography>

          <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
            The gallery offers a platform to bring forth young upcoming artists and also organizes shows for renowned artists. Swasti aspires to create a space for art lovers and buyers by exhibiting quality art pieces. They aim at raising funds for the HCG foundation to help support the cancer patients.
          </Typography>
        </div>

        {/* Side-by-side Section: Narrative + 2x2 Feature Box */}
        <div className="flex flex-col lg:flex-row gap-[2rem] xl:gap-[3rem] items-start lg:items-center pt-[0.5rem]">
          {/* Left Side: heading + all paragraphs */}
          <div className="w-full lg:flex-1 flex flex-col">
            <Typography variant="heading-8" as="h3" className={SUBHEADING_CLASS}>
              Art Therapy: Healing Through the Creative Process
            </Typography>

            <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
              In 2018, Swasti Art Gallery extended its mission from the gallery walls to direct patient care with the launch of its Art Therapy program at HCG Bangalore hospital. Art therapy is a form of expressive therapy that uses the creative process of making art to support a patient&apos;s physical, mental, and emotional wellbeing.
            </Typography>

            <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
              Every session is built around the individual. A typical session unfolds in three parts:
            </Typography>

            <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
              • <span className="font-normal text-[#262626]">Pre-art conversation</span> : the pre-art component is crucial, especially for the first meeting between the art therapist and the patient. This allows the therapist to get to know and assess the patient
            </Typography>

            <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
              • <span className="font-normal text-[#262626]">The creative process</span> : the second part is the actual creative process, or the making of a piece or pieces of art. The therapist may teach the patient some art techniques, but the most important thing is to simply create something...
            </Typography>

            <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
              • <span className="font-normal text-[#262626]">Post-art reflection</span> : Patient and therapist discuss the finished piece together, the patient is expected to talk about their feelings, what led them to create that art, how they felt while making the art and their thoughts post completing it.
            </Typography>
          </div>

          {/* Right Side: 2x2 Feature Box (Figma Rectangle 1673: 762px x 597px) */}
          <div
            ref={boxRef}
            className="w-full lg:w-[48%] xl:w-[47.625rem] lg:max-w-none xl:max-w-[47.625rem] h-auto sm:h-[37.3125rem] shrink-0 mx-auto lg:mx-0"
          >
            <div className="w-full h-full rounded-[0.375rem] border border-[#FFECC5] bg-gradient-to-b from-[#FFFBEE] to-[#FEF3D3] p-[1.5rem] sm:p-[2rem] xl:p-[3rem] grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 relative">
              {/* Center Vertical Divider */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%-4rem)] max-h-[31.6296rem] w-[0.0625rem] z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                }}
              />

              {/* Center Horizontal Divider */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-4rem)] max-w-[26.4375rem] h-[0.0625rem] z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                }}
              />

              {ART_GALLERY_CARDS.map((card, index) => {
                const isFirstRow = index < 2;
                const isFirstCol = index % 2 === 0;

                return (
                  <React.Fragment key={card.title}>
                    <div
                      className={`flex flex-col justify-center motion-reduce:!transition-none ${
                        isFirstCol ? "sm:pr-[2rem] xl:pr-[2.5rem]" : "sm:pl-[2rem] xl:pl-[2.5rem]"
                      } ${
                        isFirstRow ? "sm:pb-[2rem] xl:pb-[2.5rem]" : "sm:pt-[2rem] xl:pt-[2.5rem]"
                      } py-4 sm:py-0`}
                      style={cardStyle(cardsVisible, index)}
                    >
                      {/* Icon Circle */}
                      <div className="w-[5.0625rem] h-[5.0625rem] rounded-full bg-[#F0DEB8] flex items-center justify-center shrink-0">
                        <Image
                          src={card.icon}
                          alt={card.title}
                          width={43}
                          height={43}
                          className="w-[2.6875rem] h-[2.6875rem] object-contain"
                        />
                      </div>

                      {/* Card Title */}
                      <div className="mt-[1rem]">
                        <Typography
                          variant="heading-8"
                          as="h4"
                          className="font-argestadisplay font-normal text-left text-[#000000]"
                        >
                          {card.title}
                        </Typography>
                      </div>

                      {/* Card Description */}
                      <div className="mt-[0.5rem] max-w-[18.5625rem]">
                        <Typography
                          variant="body-7"
                          as="p"
                          className="font-manrope font-medium text-left text-[#606060]"
                        >
                          {card.description}
                        </Typography>
                      </div>
                    </div>

                    {/* Mobile Fading Divider */}
                    {index !== ART_GALLERY_CARDS.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="sm:hidden w-full max-w-[18rem] mx-auto h-[0.0625rem] my-[0.75rem]"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Closing Paragraphs */}
        <div className="flex flex-col pt-[0.5rem]">
          <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
            Sessions can be individual, group, or family based allowing patients to process their experience alongside fellow patients navigating the same journey, always with the choice to share only what feels comfortable.
          </Typography>

          <Typography variant="body-10" as="p" className={PARAGRAPH_CLASS}>
            Together, Swasti Gallery and Art Therapy reflect HCG Foundation&apos;s belief that cancer care extends beyond medicine. One raises the funds that make patient support possible; the other puts the healing power of art directly into patient&apos;s hands.
          </Typography>
        </div>
      </div>
    </section>
  );
}