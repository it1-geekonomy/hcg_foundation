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
              variant="heading-1"
              as="h1"
              style={{ textAlign: "left" }}
              className="font-tiempos-headline font-normal !text-left text-[#0D2838] text-[clamp(1.5rem,2.8vw,2.875rem)]"
            >
              <span className="block whitespace-nowrap">
                Creating Lasting Change <span className="hidden 2xl:inline">Through</span>
              </span>
              <span className="block whitespace-nowrap">
                <span className="2xl:hidden">Through </span>Partnership
              </span>
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

        {/* 2x2 Vertical Image Cards Grid matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {PHILANTHROPY_CARDS.map((card) => (
            <div
              key={card.id}
              className="group flex flex-col justify-between overflow-hidden rounded-lg bg-white border border-black/[0.04] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Circular Icon Badge + Title + Description */}
              <div className="p-4 sm:p-5 lg:p-6 xl:p-8 flex items-start gap-3 sm:gap-4 xl:gap-5 min-h-[7.5rem] sm:min-h-[8.5rem] xl:min-h-[11.25rem]">
                <div className="w-[3.25rem] h-[3.25rem] sm:w-[4rem] sm:h-[4rem] lg:w-[4.25rem] lg:h-[4.25rem] xl:w-[6.6875rem] xl:h-[6.6875rem] shrink-0 rounded-full bg-[#FFF3CC] flex items-center justify-center p-[0.75rem] sm:p-[1rem] lg:p-[1.125rem] xl:p-[27.25px]">
                  <img
                    src={card.iconUrl}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="mb-2">
                    <Typography variant="heading-10" as="h2" className="font-argestadisplay font-normal text-[#0D2838]">
                      <span className="block">{card.title}</span>
                      {card.titleLine2 && (
                        <span className="block">{card.titleLine2}</span>
                      )}
                    </Typography>
                  </div>
                  <Typography variant="body-9" as="p" className="font-manrope font-normal text-[#606060]">
                    {card.description}
                  </Typography>
                </div>
              </div>

              {/* Card Bottom: Full Width Image Asset */}
              <div className="w-full h-[13.75rem] sm:h-[15.625rem] lg:h-[17.5rem] overflow-hidden relative bg-[#EFEAD8]">
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
        <div className="mt-10 sm:mt-14 lg:mt-16 rounded-xl bg-[#FFF4CF] px-6 sm:px-10 lg:pl-[3.375rem] lg:pr-[2.875rem] py-6 sm:py-8 lg:pt-[2.25rem] lg:pb-[1.6875rem] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 sm:gap-8 xl:gap-12 2xl:gap-16">
          <div className="shrink-0">
            <Typography
              variant="heading-1"
              as="h2"
              className="font-tiempos-headline font-normal !text-left text-[#0D2838]"
            >
              Creating Lasting Change
              <span className="block">Through Partnership</span>
            </Typography>
          </div>
          <div className="flex flex-col items-start gap-3 sm:gap-3.5 max-w-[32rem]">
            <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-left text-[#121212]">
              Your contribution can help a patient receive care, give a family hope, and help build healthier communities.
            </Typography>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-full sm:w-[13.1875rem] h-[3rem] sm:h-[3.5625rem] inline-flex items-center justify-center pl-[1.1025rem] pr-[0.58rem] py-[0.58rem] gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[42px] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0"
            >
              <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[1rem] h-[0.8rem] sm:w-[1.2925rem] sm:h-[1.034rem] shrink-0 text-[#2D2D2D]" />
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
