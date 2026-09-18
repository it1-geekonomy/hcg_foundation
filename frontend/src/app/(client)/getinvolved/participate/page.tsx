"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
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

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function ParticipatePage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] =
    useState<ParticipateModalType>(null);

  return (
    <main className="min-h-screen bg-[#FFFBEA] pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Section matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="md:col-span-6 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block size-2 rounded-full bg-[#6F5E09]" />
              <Typography variant="body-8" as="span" className="font-manrope font-normal text-[#6F5E09]">
                Our Mission
              </Typography>
            </div>
            <Typography
              variant="heading-1"
              as="h1"
              className="font-tiempos-headline font-normal text-left text-[#0D2838]"
            >
              Art Gallery & Art Therapy Sessions
            </Typography>
          </div>
          <div className="md:col-span-6 md:pt-7 flex justify-start md:justify-end">
            <div className="max-w-[35.5rem] text-left">
              <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-[#596D79]">
                Your time, skills and support can bring hope to patients and families. Explore the different ways you can get involved with HCG Foundation.
              </Typography>
            </div>
          </div>
        </div>

        {/* 3-Column Vertical Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {PARTICIPATE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-lg bg-[#FFF9EA] border border-[#F3E3B6] shadow-xs transition duration-300 hover:shadow-md"
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

              {/* Card Body: Title, Description, Apply Button */}
              <div className="p-6 sm:p-7 pt-3 flex-1 flex flex-col justify-between">
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCCC2D] text-[#2D2D2D] rounded-md shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
                  >
                    <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
                      Apply Now
                    </Typography>
                    <ArrowUpRight className="size-4 sm:size-5 text-[#2D2D2D]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Benefits Banner matching Figma Frame 577 */}
        <div className="rounded-md bg-[#FFF4CF] p-6 sm:p-10 lg:p-12 border border-[#F3E3B6] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 items-center">
          {PARTICIPATE_BENEFITS.map((benefit) => (
            <div key={benefit.id} className="flex items-center gap-4 lg:gap-5">
              <div className="size-14 lg:size-16 rounded-full bg-[#FFF3CC] flex items-center justify-center border border-[#E4CD72] shrink-0 p-3 lg:p-3.5">
                <img
                  src={benefit.iconUrl}
                  alt={benefit.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="mb-1.5">
                  <Typography
                    variant="body-1"
                    as="h3"
                    className="font-argestadisplay font-normal text-left text-[#2C2C2C]"
                  >
                    {benefit.title}
                  </Typography>
                </div>
                <Typography variant="body-9" as="p" className="font-manrope font-normal text-[#6C6C6C]">
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
