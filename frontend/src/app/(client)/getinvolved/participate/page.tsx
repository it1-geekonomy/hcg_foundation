"use client";

import React, { useState } from "react";
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
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="Participate"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="Participate"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Eyebrow: Our Mission a little up */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <span className="inline-block size-2.5 rounded-full bg-[#FCCC2D]" />
          <Typography variant="body-8" as="span" className="font-manrope font-normal text-[#8F5E09]">
            Our Mission
          </Typography>
        </div>

        {/* Equal Level Row: Title on Left, Paragraph on Right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10 sm:mb-14 items-center">
          <div className="md:col-span-2">
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838] lg:whitespace-nowrap"
            >
              Art Gallery & Art Therapy Sessions
            </Typography>
          </div>
          <div className="md:col-span-1">
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-[#596D79] text-justify"
            >
              Your time, skills and support can bring hope to patients and families. Explore the different ways you can get involved with HCG Foundation.
            </Typography>
          </div>
        </div>

        {/* 3-Column Vertical Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {PARTICIPATE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-t-[0.375rem] rounded-b-[0.25rem] bg-[#FFFCF3] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Image Asset */}
              <div className="w-full h-[15rem] sm:h-[16.25rem] lg:h-[22.1875rem] overflow-hidden relative bg-[#EFEAD8]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Floating Circular Icon Badge matching Figma Frame 556 */}
              <div className="-mt-9 lg:-mt-10 ml-6 relative z-10 size-18 lg:size-20 rounded-full bg-[#FFF3CC] flex items-center justify-center border-2 border-white shadow-sm shrink-0 p-3.5 lg:p-4">
                <img
                  src={card.iconUrl}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Body: Title, Description, Apply Button (Rectangle 1663: #FFFCF3) */}
              <div className="p-6 sm:p-7 pt-3 flex-1 flex flex-col justify-between bg-[#FFFCF3] rounded-b-[0.25rem]">
                <div>
                  <div className="mb-3">
                    <Typography variant="heading-10" as="h2" className="font-argestadisplay font-normal text-[#0D2838]">
                      {card.title}
                    </Typography>
                  </div>
                  <div className="mb-6">
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
                    className="inline-flex items-center justify-between w-[11.6875rem] h-[3.5625rem] pl-[1.1025rem] pr-[0.58rem] py-[0.58rem] gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span className="font-manrope font-semibold text-[1.125rem] leading-[150%] tracking-[0.02em] text-[#2D2D2D]">
                      Apply Now
                    </span>
                    <img
                      src="/Get Involved/Vector (5).png"
                      alt=""
                      aria-hidden="true"
                      className="w-[1.2925rem] h-[1.034rem] object-contain shrink-0"
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
            <div key={benefit.id} className="flex items-center gap-[1.3rem]">
              <div className="w-[4.9225rem] h-[4.9225rem] rounded-full border border-[#C2A947] flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                <img
                  src={benefit.iconUrl}
                  alt={benefit.title}
                  className="w-[2.38375rem] h-[2.38375rem] object-contain"
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
                <Typography
                  variant="body-9"
                  as="p"
                  className="font-manrope font-normal text-left text-[#6C6C6C]"
                >
                  {benefit.description}
                </Typography>
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
