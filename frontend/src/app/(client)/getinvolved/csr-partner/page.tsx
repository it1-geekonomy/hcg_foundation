"use client";

import React, { useState } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { CSR_PARTNER_CARDS } from "@/domains/getinvolved/constants/csr-partner";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function CsrPartnerPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="CSR Partner"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="CSR Partner"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Top Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem] items-start mb-10 sm:mb-14">
          <div>
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              <span className="block xl:whitespace-nowrap">
                Different Ways To Partner <span className="hidden xl:inline">with</span>
              </span>
              <span className="block">
                <span className="inline xl:hidden">with </span>HCG Foundation
              </span>
            </Typography>
          </div>
          <div className="flex justify-start lg:justify-end">
            <div className="w-full max-w-[45.5rem]">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-left sm:text-justify text-[#596D79]"
              >
                Corporate can partner with HCG Foundation to make your CSR investment count where it matters most. We have a wide range of partnership options for you to choose from; all of which are customizable to meet your CSR goals.
              </Typography>
            </div>
          </div>
        </div>

        {/* 2-Column Cards Grid matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem]">
          {CSR_PARTNER_CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-[0.27rem] border border-[#FFDF7C] bg-[#FDF7EB] p-[1.5rem] sm:pt-[1.4375rem] sm:px-[3.1625rem] sm:pb-[2.5rem] flex flex-col justify-start min-h-[22rem] lg:min-h-[26.4rem] transition duration-300 hover:shadow-xs"
            >
              {/* Card Number */}
              <div className="mb-[0.25rem] sm:mb-[0.5rem] text-left">
                <Typography
                  variant="heading-10"
                  as="span"
                  className="font-argestadisplay font-normal text-[#596D79]"
                >
                  {card.number}
                </Typography>
              </div>

              {/* Card Title */}
              <div className="mb-[0.75rem] sm:mb-[1rem] text-left">
                <Typography
                  variant="heading-10"
                  as="h2"
                  className="font-argestadisplay font-normal text-[#0D2838]"
                >
                  {card.title}
                </Typography>
              </div>

              {/* Card Description */}
              <div className="text-justify">
                <Typography
                  variant="body-10"
                  as="p"
                  className="font-argestadisplay font-normal text-justify text-[#596D79]"
                >
                  {card.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info Strip under Card 05 */}
        <div className="mt-[2rem] sm:mt-[2.5rem] flex items-start sm:items-center gap-[0.75rem] sm:gap-[1.5rem]">
          <div className="w-[0.25rem] self-stretch min-h-[3.5rem] bg-[#FCCC2D] shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-[0.5rem] sm:gap-[2rem] min-w-0">
            <div className="flex items-center sm:flex-col sm:items-center sm:justify-center gap-[0.5rem] sm:gap-0 shrink-0">
              <Image
                src="/Get Involved/CSR Partner/Vector.png"
                alt="Contact"
                width={23}
                height={24}
                className="w-[1.40625rem] h-[1.5rem] object-contain"
              />
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#0D2838]"
              >
                Contact Us :
              </Typography>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79]"
              >
                hcgfoundation@gmail.com
              </Typography>
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79]"
              >
                +91 8046607760
              </Typography>
            </div>
          </div>
        </div>


        {/* Bottom Impact Banner matching Figma Frame 576 */}
        <div className="mt-[2.5rem] sm:mt-[3.5rem] rounded-[0.25rem] bg-[#FFF4CF] p-[1.25rem] sm:pt-[1.1875rem] sm:pb-[1.6875rem] sm:pl-[3.375rem] sm:pr-[2.875rem] flex flex-col md:flex-row md:items-center md:justify-between gap-[1.5rem] md:gap-[2rem]">
          <div className="shrink-0">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              <span className="block">Together, We Can Create</span>
              <span className="block">Greater Impact</span>
            </Typography>
          </div>
          <div className="flex flex-col items-start gap-[0.625rem] max-w-[32rem]">
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-left text-[#121212]"
            >
              Your organisation can help strengthen cancer care, support communities, and bring meaningful change to those who need it most.
            </Typography>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-full sm:w-[13.1875rem] h-[3rem] sm:h-[3.5625rem] inline-flex items-center justify-center pl-[1.1025rem] pr-[0.58rem] py-[0.58rem] gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[42px] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0"
            >
              <Typography
                variant="button-1"
                as="span"
                className="font-manrope font-semibold text-[#2D2D2D]"
              >
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[1rem] h-[0.8rem] sm:w-[1.2925rem] sm:h-[1.034rem] shrink-0 text-[#2D2D2D]" />
            </button>
          </div>
        </div>
      </section>

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
