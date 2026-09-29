"use client";

import React, { useState } from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { PHILANTHROPY_CARDS } from "@/domains/getinvolved/constants/grants-and-philanthropy";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function GrantsAndPhilanthropyPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="Grants & Philanthropy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="Grants & Philanthropy"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="md:col-span-6 lg:col-span-7">
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              Creating Lasting Change <br className="hidden md:inline" />
              Through Partnership
            </Typography>
          </div>
          <div className="md:col-span-6 lg:col-span-5 flex justify-start md:justify-end">
            <div className="max-w-[35.5rem] text-left">
              <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-[#596D79]">
                HCG Foundation welcomes partnerships with grant-making foundations, trusts, and philanthropic organizations aligned with our mission of equitable cancer care.
              </Typography>
            </div>
          </div>
        </div>

        {/* 2x2 Vertical Image Cards Grid matching Figma (2 columns from 768px+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-5 lg:gap-[3.06rem]">
          {PHILANTHROPY_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[0.375rem] bg-[#FFFCF3] h-full min-h-0 md:min-h-[24rem] lg:min-h-[28.3125rem] 2xl:h-[28.3125rem]"
            >
              {/* Card Top: Circular Icon Badge + Title + Description */}
              <div className="p-4 sm:p-5 md:p-4 lg:p-[1.25rem] xl:p-[1.5rem] 2xl:p-[2rem] flex items-start gap-3 sm:gap-4 md:gap-3.5 lg:gap-4 xl:gap-[1.25rem] 2xl:gap-[2.38rem] bg-[#FFFCF3]">
                <div className="w-[3rem] h-[3rem] sm:w-[3.5rem] sm:h-[3.5rem] md:w-[3.25rem] md:h-[3.25rem] lg:w-[4rem] lg:h-[4rem] xl:w-[4.75rem] xl:h-[4.75rem] 2xl:w-[6.6875rem] 2xl:h-[6.6875rem] shrink-0 rounded-full bg-[#FFF3CC] flex items-center justify-center p-[0.65rem] sm:p-[0.75rem] md:p-[0.7rem] lg:p-[0.875rem] xl:p-[1rem] 2xl:p-[1.7rem]">
                  <img
                    src={card.iconUrl}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 sm:mb-2.5 lg:mb-[0.75rem] min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[2.8rem] lg:min-h-[3.6rem] 2xl:min-h-[4.75rem] flex flex-col justify-start">
                    <Typography
                      variant="heading-10"
                      as="h2"
                      className="font-argestadisplay font-normal text-[#0D2838]"
                    >
                      <span className="block">{card.title}</span>
                      {card.titleLine2 && (
                        <span className="block">{card.titleLine2}</span>
                      )}
                    </Typography>
                  </div>
                  <Typography
                    variant="body-12"
                    as="p"
                    className="font-manrope font-normal text-[#606060]"
                  >
                    {card.description}
                  </Typography>
                </div>
              </div>

              {/* Card Bottom: Full Width Image Asset (matching Figma Rectangle 1667 height: 16.1875rem) */}
              <div className="w-full h-[11.5rem] sm:h-[12.5rem] md:h-[11.5rem] lg:h-[13.5rem] xl:h-[14.5rem] 2xl:h-[16.1875rem] shrink-0 overflow-hidden relative bg-[#EFEAD8]">
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

        {/* Bottom Impact Banner matching Figma Frame 576 */}
        <div className="mt-10 sm:mt-14 lg:mt-16 rounded-xl bg-[#FFF4CF] px-6 sm:px-10 lg:pl-[3.375rem] lg:pr-[2.875rem] py-6 sm:py-8 lg:pt-[2.25rem] lg:pb-[1.6875rem] flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16">
          <div className="shrink-0">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838] leading-tight"
            >
              Creating Lasting Change <br className="hidden md:inline" />
              Through Partnership
            </Typography>
          </div>
          <div className="flex flex-col items-start gap-3 sm:gap-3.5 max-w-[32rem]">
            <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-left text-[#121212]">
              Your contribution can help a patient receive care, give a family hope, and help build healthier communities.
            </Typography>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-auto px-5 sm:px-6 lg:w-[13.1875rem] h-[2.75rem] sm:h-[3.25rem] lg:h-[3.5625rem] inline-flex items-center justify-center gap-2 sm:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[42px] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2D2D2D] whitespace-nowrap">
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[0.9rem] h-[0.75rem] sm:w-[1.1rem] sm:h-[0.9rem] lg:w-[1.2925rem] lg:h-[1.034rem] shrink-0 text-[#2D2D2D]" />
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
