"use client";

import React, { useState } from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { PHILANTHROPY_CARDS } from "@/domains/getinvolved/constants/grants-and-philanthropy";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";

const CONTAINER = "mx-[clamp(1rem,8vw,8rem)] xl:mx-[clamp(0.5rem,3vw,4rem)] 2xl:mx-[clamp(1rem,10vw,10rem)]";

export default function GrantsAndPhilanthropyPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
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
              className="group flex flex-col justify-between overflow-hidden rounded-xl bg-[#FFF9EA] border border-[#F3E3B6] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Card Top: Circular Icon Badge + Title + Description */}
              <div className="p-5 sm:p-6 lg:p-8 flex items-start gap-3.5 sm:gap-4 lg:gap-5 min-h-[9rem] sm:min-h-[10.5rem] lg:min-h-[11.25rem]">
                <div className="w-[3.5rem] h-[3.5rem] sm:w-[5rem] sm:h-[5rem] lg:w-[6.6875rem] lg:h-[6.6875rem] shrink-0 rounded-full bg-[#FFF3CC] flex items-center justify-center p-[0.875rem] sm:p-[1.25rem] lg:pt-[2rem] lg:pb-[1.7rem] lg:pl-[1.9375rem] lg:pr-[1.7rem]">
                  <img
                    src={card.iconUrl}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="mb-2">
                    <Typography variant="heading-10" as="h2" className="font-argestadisplay font-normal text-[#0D2838]">
                      {card.title}
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

        {/* Bottom Impact Banner matching Figma 100% */}
        <div className="mt-10 sm:mt-14 lg:mt-16 rounded-xl bg-[#FFF5D6] p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="max-w-lg">
              <Typography
                variant="heading-1"
                as="h2"
                className="font-tiempos-headline font-normal max-lg:!text-left text-left text-[#0D2838]"
              >
                Creating Lasting Change Through Partnership
              </Typography>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start gap-4 sm:gap-5">
            <div className="max-w-md text-justify">
              <Typography variant="body-10" as="p" className="font-argestadisplay font-normal text-[#121212]">
                Your contribution can help a patient receive care, give a family hope, and help build healthier communities.
              </Typography>
            </div>
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
