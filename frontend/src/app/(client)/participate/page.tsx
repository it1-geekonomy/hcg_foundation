"use client";

import React, { useState } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import ParticipateModal, {
  ParticipateModalType,
} from "@/shared/components/ParticipateModal";
import {
  PARTICIPATE_CARDS,
  PARTICIPATE_BENEFITS,
} from "@/domains/getinvolved/constants/participate";
import Banner from "@/shared/components/Herobannersection";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function ParticipatePage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] =
    useState<ParticipateModalType>(null);

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      {/* Top Hero Banner (Commented out) */}
      {/*
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="Participate"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="Participate"
      />
      */}

      <section className={`${CONTAINER} pt-7 sm:pt-[6.5rem] lg:pt-[10.25rem] pb-8 sm:pb-12 lg:pb-16`}>
        {/* Eyebrow: Our Mission a little up */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-[#FCCC2D]" />
            <Typography variant="body-8" as="span" className="font-manrope font-normal text-[#8F5E09]">
              Our Mission
            </Typography>
          </div>
        </div>

        {/* Equal Level Row: Title on Left, Paragraph on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-10 sm:mb-14 items-start">
          <div className="md:col-span-6 lg:col-span-8">
            <div className="md:max-w-[21rem] lg:max-w-none">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838] lg:whitespace-nowrap"
              >
                Find Your Way to Make an Impact
              </Typography>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-4">
            <div>
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-[#596D79] text-left !leading-relaxed"
              >
                Your time, skills and support can bring hope to patients and families. Explore the different ways you can get involved with HCG Foundation.
              </Typography>
            </div>
          </div>
        </div>

        {/* 3-Column Vertical Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 mb-12 sm:mb-16">
          {PARTICIPATE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-t-[0.375rem] rounded-b-[0.25rem] bg-[#FFFCF3] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Image Asset */}
              <div className="w-full h-[15rem] sm:h-[16.25rem] md:h-[11rem] lg:h-[16.5rem] xl:h-[22.1875rem] overflow-hidden relative bg-[#EFEAD8]">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  priority={card.id === PARTICIPATE_CARDS[0].id}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Floating Circular Icon Badge matching Figma Frame 556 */}
              <div className="-mt-8 md:-mt-7 lg:-mt-10 ml-4 md:ml-4 lg:ml-6 relative z-10 size-16 md:size-14 lg:size-20 rounded-full bg-[#FFF3CC] flex items-center justify-center shrink-0 p-3 md:p-2.5 lg:p-4">
                <Image
                  src={card.iconUrl}
                  alt={card.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Body: Title, Description, Apply Button (Rectangle 1663: #FFFCF3) */}
              <div className="p-5 md:p-3.5 lg:p-7 pt-2.5 md:pt-2 lg:pt-3 flex-1 flex flex-col justify-between bg-[#FFFCF3] rounded-b-[0.25rem]">
                <div>
                  <div className="mb-2 md:mb-1.5 lg:mb-3">
                    <Typography variant="heading-10" as="h2" className="font-argestadisplay font-normal text-[#0D2838]">
                      {card.title}
                    </Typography>
                  </div>
                  <div className="mb-4 md:mb-3 lg:mb-6">
                    <Typography variant="body-9" as="p" className="font-manrope font-normal text-[#6C6C6C]">
                      {card.description}
                    </Typography>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalType(card.id as ParticipateModalType)
                    }
                    className="inline-flex items-center justify-between w-[9.5rem] sm:w-[10.5rem] md:w-[8.5rem] lg:w-[11.6875rem] h-[2.5rem] md:h-[2.5rem] lg:h-[3.5625rem] pl-3.5 pr-2 py-1.5 md:pl-2.5 md:pr-1.5 lg:pl-[1.1025rem] lg:pr-[0.58rem] lg:py-[0.58rem] gap-2 lg:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span className="font-manrope font-semibold text-[0.875rem] sm:text-[1rem] md:text-[0.875rem] lg:text-[1.125rem] leading-[150%] tracking-[0.02em] text-[#2D2D2D]">
                      Apply Now
                    </span>
                    <Image
                      src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849562451-vj014-vector-17-.webp"
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={16}
                      className="w-[1rem] h-[0.8rem] md:w-[0.9rem] md:h-[0.75rem] lg:w-[1.2925rem] lg:h-[1.034rem] object-contain shrink-0"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Benefits Banner matching Figma Frame 577: #FFF4CF, Radius 0.375rem, Padding Top 1.9375rem, Bottom 2.25rem, Left/Right 1.25rem */}
        <div className="bg-[#FFF4CF] rounded-[0.375rem] pt-[1.9375rem] pb-[2.25rem] px-5 sm:px-[1.25rem] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
          {PARTICIPATE_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="flex items-center gap-3.5 sm:gap-4 lg:gap-[1.3rem]"
            >
              <div className="w-[3.25rem] h-[3.25rem] sm:w-[3.75rem] sm:h-[3.75rem] lg:w-[4.9225rem] lg:h-[4.9225rem] rounded-full border border-[#C2A947] flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                <Image
                  src={benefit.iconUrl}
                  alt={benefit.title}
                  width={38}
                  height={38}
                  className="w-[1.625rem] h-[1.625rem] sm:w-[1.875rem] sm:h-[1.875rem] lg:w-[2.38375rem] lg:h-[2.38375rem] object-contain"
                />
              </div>
              <div className="text-left">
                <div className="mb-0.5 sm:mb-1">
                  <Typography
                    variant="body-2"
                    as="h3"
                    className="font-argestadisplay font-normal text-left text-[#2C2C2C]"
                  >
                    {benefit.title}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body-9"
                    as="p"
                    className="font-manrope font-normal text-left text-[#6C6C6C]"
                  >
                    {benefit.description}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Participate Application Modal (Intern, Fundraise, Volunteer) */}
      <ParticipateModal
        isOpen={!!activeModalType}
        type={activeModalType}
        onClose={() => setActiveModalType(null)}
      />

      {/* Partner With Us Popup Modal */}
      <PartnerWithUsModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {/* Donate Form Section */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}