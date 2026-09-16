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
            <Typography variant="heading-1" as="h1" className="text-[#2E1C12]">
              Different Ways To Partner with HCG Foundation
            </Typography>
          </div>
          <div className="lg:col-span-6 flex justify-end">
            <div className="max-w-2xl">
              <Typography variant="body-8" as="p" className="text-[#6C6048]">
                Corporate can partner with HCG Foundation to make your CSR investment count where it matters most. We have a wide range of partnership options for you to choose from; all of which are customizable to meet your CSR goals.
              </Typography>
            </div>
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
                <div className="mb-2">
                  <Typography variant="display-1" as="span" className="text-[#2E1C12]/40">
                    {card.number}
                  </Typography>
                </div>
                <div className="mb-3">
                  <Typography variant="heading-2" as="h2" className="text-[#2E1C12]">
                    {card.title}
                  </Typography>
                </div>
                <Typography variant="body-8" as="p" className="text-[#6C6048]">
                  {card.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Impact Banner */}
        <div className="mt-12 sm:mt-16 rounded-[8px] bg-[#FFF4D4] p-6 sm:p-10 border border-[#F3E3B6] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <Typography variant="heading-2" as="h2" className="text-[#2E1C12]">
              Together, We Can Create Greater Impact
            </Typography>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-4">
            <div className="max-w-md lg:text-right">
              <Typography variant="body-8" as="p" className="text-[#6C6048]">
                Your organisation can help strengthen cancer care, support communities, and bring meaningful change to those who need it most.
              </Typography>
            </div>
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
