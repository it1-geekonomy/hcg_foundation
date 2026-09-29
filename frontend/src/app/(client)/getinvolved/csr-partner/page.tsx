"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { CSR_PARTNER_CARDS } from "@/domains/getinvolved/constants/csr-partner";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { cn } from "@/lib/utils";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function CsrPartnerPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!(e.target as HTMLElement).closest?.("[data-csr-card]")) {
        setActiveCardId(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  const handleCardClick = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem] items-start mb-10 sm:mb-14">
          <div>
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              Different Ways To Partner with HCG Foundation
            </Typography>
          </div>
          <div className="flex justify-start lg:justify-end">
            <div className="w-full lg:max-w-[45.5rem]">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-left text-[#596D79] !leading-relaxed"
              >
                Corporate can partner with HCG Foundation to make your CSR investment count where it matters most. We have a wide range of partnership options for you to choose from; all of which are customizable to meet your CSR goals.
              </Typography>
            </div>
          </div>
        </div>

        {/* 2-Column Cards Grid matching Figma (2 columns from 768px+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] md:gap-[1.75rem] lg:gap-[2.5rem]">
          {CSR_PARTNER_CARDS.map((card) => {
            const isActive = activeCardId === card.id;

            return (
              <div
                key={card.id}
                data-csr-card
                onClick={() => handleCardClick(card.id)}
                className="relative group cursor-pointer select-none h-full"
              >
                {/* Underneath Stacked Card Sheet (Pops out to bottom-right on hover or active tap) */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 rounded-[0.27rem] border border-[#FFDF7C]/70 bg-[#F5ECCB]/80 transition-all duration-500 ease-out pointer-events-none",
                    isActive
                      ? "translate-x-2 translate-y-2 opacity-100"
                      : "translate-x-0 translate-y-0 opacity-0 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:opacity-100"
                  )}
                />

                {/* Main Card (Lifts to top-left on hover or active tap) */}
                <div
                  className={cn(
                    "relative z-10 rounded-[0.27rem] border border-[#FFDF7C] bg-[#FDF7EB] p-5 sm:p-6 md:p-6 lg:pt-[1.4375rem] lg:pl-[3.725rem] lg:pr-[2.58rem] lg:pb-[2.5rem] flex flex-col justify-start h-full min-h-0 md:min-h-[22rem] lg:min-h-[26.4rem] transition-all duration-500 ease-out",
                    isActive
                      ? "-translate-x-1 -translate-y-1 shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                      : "group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                  )}
                >
                  {/* Card Number */}
                  <div className="mb-[0.25rem] sm:mb-[0.5rem] text-left">
                    <Typography
                      variant="display-3"
                      as="span"
                      className="font-argestadisplay font-normal text-[#596D79]"
                    >
                      {card.number}
                    </Typography>
                  </div>

                  {/* Card Title */}
                  <div className="mb-[0.75rem] sm:mb-[1rem] text-left">
                    <Typography
                      variant="heading-11"
                      as="h2"
                      className="font-argestadisplay font-normal text-[#0D2838]"
                    >
                      {card.title}
                    </Typography>
                  </div>

                  {/* Card Description */}
                  <div className="text-left">
                    <Typography
                      variant="body-11"
                      as="p"
                      className="font-argestadisplay font-normal text-left text-[#596D79] !leading-relaxed"
                    >
                      {card.description}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
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
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838] leading-tight"
            >
              <span className="inline md:block">Together, We Can Create </span>
              <span className="inline md:block">Greater Impact</span>
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
              className="w-auto px-5 sm:px-6 lg:w-[13.1875rem] h-[2.75rem] sm:h-[3.25rem] lg:h-[3.5625rem] inline-flex items-center justify-center gap-2 sm:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[2.625rem] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Typography
                variant="button-1"
                as="span"
                className="font-manrope font-semibold text-[#2D2D2D] whitespace-nowrap"
              >
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[0.9rem] h-[0.75rem] sm:w-[1.2925rem] sm:h-[1.034rem] shrink-0 text-[#2D2D2D]" />
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
