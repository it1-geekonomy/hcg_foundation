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

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

export default function ParticipatePage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] =
    useState<ParticipateModalType>(null);

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Section matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block size-2 rounded-full bg-[#B88700]" />
              <Typography variant="body-8" as="span" className="text-[0.75rem] font-semibold text-[#B88700] uppercase tracking-wider">
                Our Mission
              </Typography>
            </div>
            <Typography variant="heading-1" as="h1" className="font-serif text-[1.5rem] sm:text-[1.875rem] lg:text-[2.5rem] italic text-[#2E1C12] tracking-tight font-normal leading-tight lg:leading-[3rem]">
              Art Gallery & Art Therapy Sessions
            </Typography>
          </div>
          <div className="lg:col-span-6 lg:pt-6">
            <Typography variant="body-8" as="p" className="text-[0.875rem] sm:text-[1rem] lg:text-[1.1875rem] text-[#6C6048] leading-relaxed lg:leading-[1.6875rem] text-justify max-w-2xl lg:ml-auto">
              Your time, skills and support can bring hope to patients and families. Explore the different ways you can get involved with HCG Foundation.
            </Typography>
          </div>
        </div>

        {/* 3-Column Vertical Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {PARTICIPATE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[8px] bg-[#FFF9EA] border border-[#F3E3B6] shadow-xs transition duration-300 hover:shadow-md"
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

              {/* Floating Circular Icon Badge */}
              <div className="-mt-8 ml-6 relative z-10 size-16 rounded-full bg-[#FDE599] flex items-center justify-center border-2 border-white shadow-sm shrink-0 p-3.5">
                <img
                  src={card.iconUrl}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Body: Title, Description, Apply Button */}
              <div className="p-6 sm:p-7 pt-3 flex-1 flex flex-col justify-between">
                <div>
                  <Typography variant="heading-2" as="h2" className="font-serif text-[1.25rem] sm:text-[1.5rem] lg:text-[2rem] font-normal text-[#2E1C12] leading-tight mb-3">
                    {card.title}
                  </Typography>
                  <Typography variant="body-8" as="p" className="text-[0.875rem] sm:text-[1rem] lg:text-[1.0625rem] leading-relaxed text-[#6C6048] mb-6">
                    {card.description}
                  </Typography>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalType(card.id as ParticipateModalType)
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCCC2D] text-[#382E07] text-[0.875rem] sm:text-[1rem] lg:text-[1.0625rem] font-semibold rounded-[6px] shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
                  >
                    <Typography variant="body-8" as="span">Apply Now</Typography>
                    <ArrowUpRight className="size-4 sm:size-5 text-[#382E07]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Benefits Banner matching Figma */}
        <div className="rounded-[6px] bg-[#FFF5D6] p-6 sm:p-10 lg:p-12 border border-[#F3E3B6] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 items-center">
          {PARTICIPATE_BENEFITS.map((benefit) => (
            <div key={benefit.id} className="flex items-center gap-4 lg:gap-5">
              <div className="size-14 lg:size-16 rounded-full bg-[#FDE599]/70 flex items-center justify-center border border-[#FCCC2D]/40 shrink-0 p-3 lg:p-3.5">
                <img
                  src={benefit.iconUrl}
                  alt={benefit.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <Typography variant="heading-3" as="h3" className="font-serif text-[1.125rem] sm:text-[1.25rem] lg:text-[1.5625rem] font-normal text-[#2E1C12] leading-tight mb-1.5">
                  {benefit.title}
                </Typography>
                <Typography variant="body-8" as="p" className="text-[0.75rem] sm:text-[0.875rem] lg:text-[1.09375rem] text-[#6C6048] leading-relaxed">
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
