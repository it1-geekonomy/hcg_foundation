"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PartnerWithUsModal from "@/shared/components/PartnerWithUsModal";
import { CSR_PARTNER_CARDS } from "@/domains/getinvolved/constants/csr-partner";

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

export default function CsrPartnerPage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Top Header Section aligned 100% with Navbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="lg:col-span-6">
            <Typography variant="heading-1" as="h1" style={{ textAlign: "left" }} className="font-serif text-[1.5rem] sm:text-[1.875rem] lg:text-[2.5rem] italic text-[#2E1C12] tracking-tight font-normal leading-tight lg:leading-[3rem]">
              Different Ways To Partner with HCG Foundation
            </Typography>
          </div>
          <div className="lg:col-span-6">
            <Typography variant="body-8" as="p" style={{ textAlign: "left" }} className="font-manrope text-[0.875rem] sm:text-[1rem] lg:text-[1.0625rem] text-[#6C6048] leading-relaxed lg:leading-[1.6875rem] text-justify max-w-2xl lg:ml-auto">
              Corporate can partner with HCG Foundation to make your CSR investment count where it matters most. We have a wide range of partnership options for you to choose from; all of which are customizable to meet your CSR goals.
            </Typography>
          </div>
        </div>

        {/* 2-Column Horizontal Cards Grid with Larger Readable Desktop Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {CSR_PARTNER_CARDS.map((card) => (
            <div
              key={card.id}
              className="group relative flex flex-col sm:flex-row overflow-hidden rounded-[8px] bg-[#FFF9EA] border border-[#F3E3B6] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Left Column: Image Asset */}
              <div className="sm:w-[12.5rem] md:w-[13.125rem] lg:w-[14.375rem] shrink-0 overflow-hidden relative min-h-[13.75rem] sm:min-h-full bg-[#EFEAD8]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Right Column: Number, Title, Description (Increased Text Size for Desktop Legibility) */}
              <div className="flex-1 p-6 sm:p-7 flex flex-col justify-start">
                <Typography variant="display-1" as="span" style={{ textAlign: "left" }} className="font-serif text-[1.875rem] sm:text-[2.25rem] lg:text-[3.125rem] font-normal text-[#2E1C12]/40 tracking-tight mb-2">
                  {card.number}
                </Typography>
                <Typography variant="heading-2" as="h2" style={{ textAlign: "left" }} className="font-serif text-[1.25rem] sm:text-[1.5rem] lg:text-[1.875rem] font-normal text-[#2E1C12] leading-tight mb-3">
                  {card.title}
                </Typography>
                <Typography variant="body-8" as="p" style={{ textAlign: "left" }} className="font-manrope text-[0.875rem] sm:text-[1rem] lg:text-[0.96875rem] leading-relaxed lg:leading-[1.5625rem] text-[#6C6048] font-normal text-justify">
                  {card.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Impact Banner */}
        <div className="mt-12 sm:mt-16 rounded-[8px] bg-[#FFF4D4] p-6 sm:p-10 border border-[#F3E3B6] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <Typography variant="heading-2" as="h2" style={{ textAlign: "left" }} className="font-serif text-[1.5rem] sm:text-[1.875rem] lg:text-[2.25rem] italic text-[#2E1C12] font-normal leading-tight">
              Together, We Can Create Greater Impact
            </Typography>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-4">
            <Typography variant="body-8" as="p" style={{ textAlign: "left" }} className="font-manrope text-[0.75rem] sm:text-[0.875rem] lg:text-[0.9375rem] text-[#6C6048] max-w-md lg:text-right">
              Your organisation can help strengthen cancer care, support communities, and bring meaningful change to those who need it most.
            </Typography>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#FCCC2D] text-[#382E07] text-[0.875rem] sm:text-[1rem] lg:text-[1.0625rem] font-semibold rounded-[6px] shadow-xs transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
            >
              <Typography variant="body-8" as="span">Partner With Us</Typography>
              <ArrowUpRight className="size-4 sm:size-5 text-[#382E07]" />
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
