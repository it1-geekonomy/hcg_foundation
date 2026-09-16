"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { PHILANTHROPY_CARDS } from "@/domains/getinvolved/constants/grants-and-philanthropy";

const CONTAINER = "max-w-[1200px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6";

export default function GrantsAndPhilanthropyPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="lg:col-span-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[44px] italic text-[#2E1C12] tracking-tight font-normal leading-tight lg:leading-[48px]">
              Creating Lasting Change Through Partnership
            </h1>
          </div>
          <div className="lg:col-span-6">
            <p className="font-manrope text-sm sm:text-base lg:text-[19px] text-[#6C6048] leading-relaxed lg:leading-[27px] text-justify max-w-2xl lg:ml-auto">
              HCG Foundation welcomes partnerships with grant-making foundations, trusts, and philanthropic organizations aligned with our mission of equitable cancer care.
            </p>
          </div>
        </div>

        {/* 2x2 Vertical Image Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PHILANTHROPY_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[12px] bg-[#FFF9EA] border border-[#F3E3B6] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Circular Icon Badge + Title + Description */}
              <div className="p-6 sm:p-8 flex items-start gap-4 sm:gap-5 min-h-[160px] sm:min-h-[180px]">
                <div className="size-13 sm:size-15 shrink-0 rounded-full bg-[#FDE599]/70 flex items-center justify-center border border-[#FCCC2D]/40 p-3">
                  <img
                    src={card.iconUrl}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl lg:text-[28px] font-normal text-[#2E1C12] leading-tight mb-2">
                    {card.title}
                  </h2>
                  <p className="font-manrope text-sm sm:text-base lg:text-[19px] leading-relaxed text-[#6C6048]">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Full Width Image Asset */}
              <div className="w-full h-[220px] sm:h-[250px] lg:h-[280px] overflow-hidden relative bg-[#EFEAD8]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover object-[center_top] transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Impact Banner matching Figma 100% */}
        <div className="mt-10 sm:mt-14 lg:mt-16 rounded-[12px] bg-[#FFF5D6] p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[42px] italic text-[#2E1C12] font-normal leading-tight lg:leading-[50px] max-w-lg">
              Creating Lasting Change Through Partnership
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start gap-4 sm:gap-5">
            <p className="font-manrope text-sm sm:text-base lg:text-[18px] text-[#5A503C] leading-relaxed max-w-md text-left">
              Your contribution can help a patient receive care, give a family hope, and help build healthier communities.
            </p>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-[#FCCC2D] text-[#382E07] text-sm sm:text-base lg:text-[18px] font-semibold rounded-[6px] shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
            >
              <span>Partner With Us</span>
              <ArrowUpRight className="size-4 sm:size-5 lg:size-5.5 text-[#382E07]" />
            </button>
          </div>
        </div>
      </section>

      {/* Partner With Us Modal */}
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
