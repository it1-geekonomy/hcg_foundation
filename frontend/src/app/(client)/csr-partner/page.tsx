"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { CSR_PARTNER_CARDS } from "@/domains/getinvolved/constants/csr-partner";
import PartnerLogosMarquee from "@/domains/getinvolved/components/PartnerLogosMarquee";
import Banner from "@/shared/components/Herobannersection";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { cn } from "@/lib/utils";

const CONTAINER = "max-w-[70rem] xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8";

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
      {/* Top Hero Banner (Commented out) */}
      {/*
      <Banner
        bgImage="/Get Involved/Get Involved banner image.png"
        bgImageAlt="CSR Partner"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved" },
        ]}
        title="CSR Partner"
      />
      */}

      <section className={`${CONTAINER} pt-7 sm:pt-[5rem] lg:pt-[6.5rem] xl:pt-[7rem] 2xl:pt-[7.5rem] pb-8 sm:pb-12 lg:pb-16`}>
        {/* Top Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem] items-start mb-8 sm:mb-10 lg:mb-12">
          <div>
            <Typography
              variant="heading-2"
              as="h2"
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

        {/* CSR Partner Logos Infinite Moving Marquee (Above Cards Grid) */}
        <PartnerLogosMarquee />

        {/* 2-Column Cards Grid matching Figma (2 columns from 768px+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-4.5 2xl:gap-5">
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
                    "relative z-10 rounded-[0.27rem] border border-[#FFDF7C] bg-[#FDF7EB] p-3.5 sm:p-4 md:p-4 lg:py-2.5 lg:px-4 xl:py-3 xl:px-4.5 2xl:py-3.5 2xl:px-5 flex flex-col justify-start h-full min-h-0 transition-all duration-500 ease-out",
                    isActive
                      ? "-translate-x-1 -translate-y-1 shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                      : "group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(252,204,45,0.18)]"
                  )}
                >
                  {/* Card Number & Title in One Line */}
                  <div className="flex items-baseline gap-2 sm:gap-2.5 mb-2 text-left">
                    <Typography
                      variant="heading-9"
                      as="span"
                      className="font-argestadisplay font-normal text-[#596D79] shrink-0"
                    >
                      {card.number.replace(/^0+/, "")}.
                    </Typography>
                    <Typography
                      variant="heading-8"
                      as="h2"
                      className="font-argestadisplay font-normal text-[#0D2838] break-words !text-left"
                    >
                      {card.title}
                    </Typography>
                  </div>

                  {/* Card Description */}
                  <div className="text-left">
                    <Typography
                      variant="body-11"
                      as="p"
                      className="font-argestadisplay font-normal text-left text-[#596D79] !leading-relaxed break-words"
                    >
                      {card.description}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Info Strip: yellow bar at left edge of container, info centered */}
        <div className="relative mt-[2rem] sm:mt-[2.5rem] w-full flex sm:items-center justify-start sm:justify-center min-h-[3.5rem]">
          {/* Yellow line at the left edge of the container */}


          {/* Centered Contact Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[0.5rem] sm:gap-[2rem] text-left sm:text-left">
            <div className="flex items-center justify-center items-start sm:flex-col sm:items-center sm:justify-center gap-[0.5rem] sm:gap-0 shrink-0">
              <Image
                src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849990827-u27ma-fa7-solid_contact-book.webp"
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
            <div className="flex flex-col text-center sm:text-left min-w-0">
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79]"
              >
                info@hcgfoundation.org
              </Typography>
              <Typography
                variant="body-10"
                as="span"
                className="font-argestadisplay font-normal text-[#596D79] text-left"
              >
                +91 8046607760
              </Typography>
            </div>
          </div>
        </div>

        {/* Bottom Impact Banner matching Figma Frame 576 */}
        <div className="mt-[2.5rem] sm:mt-[3.5rem] rounded-[0.25rem] bg-[#FFF4CF] p-[1.25rem] sm:pt-[1.1875rem] sm:pb-[1.6875rem] sm:px-[2rem] md:px-[2rem] lg:px-[2rem] flex flex-col md:flex-row md:items-start md:justify-between gap-[1.5rem] md:gap-[1.5rem]">
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
          <div className="w-full flex-1 flex flex-col items-start gap-[0.625rem] md:max-w-[45rem]">

            <div className="w-full">
              <Typography
                variant="body-10"
                as="p"
                className="font-argestadisplay font-normal text-left text-[#121212]"
              >
                Your organisation can help strengthen cancer care, support communities, and bring meaningful change to those who need it most.
              </Typography>
            </div>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="self-center md:self-start w-auto min-w-[11rem] px-5 sm:px-6 lg:px-6 h-[2.75rem] sm:h-[3.25rem] lg:h-[3.5625rem] inline-flex items-center justify-center gap-2 sm:gap-[0.58rem] bg-[#FCCC2D] text-[#2D2D2D] rounded-[0.375rem] border border-white/10 backdrop-blur-[2.625rem] transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Typography
                variant="button-3"
                as="span"
                className="font-manrope font-semibold text-[#2D2D2D] whitespace-nowrap"
              >
                Partner With Us
              </Typography>
              <DiagonalArrowIcon className="w-[0.8rem] h-[0.7rem] sm:w-[1rem] sm:h-[0.825rem] shrink-0 text-[#2D2D2D]" />
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