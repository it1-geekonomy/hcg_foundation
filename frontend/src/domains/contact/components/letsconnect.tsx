"use client";

import React from "react";
import Typography from "@/lib/Typography";
import ContactInfoSection from "./ContactInfoSection";
import ContactFormSection from "./ContactFormSection";

const SECTION_PADDING =
  "pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-20 lg:px-6 xl:px-6 2xl:px-40";

export default function ClientContact() {
  return (
    <main className="min-h-screen bg-[#FFF8E2] text-[#2F2707] font-manrope">
      <section className={SECTION_PADDING}>
        {/* Heading */}
        <div className="w-full text-left">
          <Typography
            variant="heading-3"
            as="h1"
            className="font-tiempos-headline font-medium italic !text-left text-[#0D2838]"
          >
            Let&apos;s Connect
          </Typography>

          <div className="mt-3 sm:mt-4 max-w-full lg:max-w-[68.75rem]">
            <Typography
              variant="body-3"
              as="p"
              className="font-argestadisplay font-normal text-left text-[#596D79]"
            >
              Whether you&apos;re seeking patient support, exploring partnership
              opportunities, interested in volunteering, or simply have a
              question, we&apos;re here to help. Reach out to us, and our team
              will get back to you as soon as possible.
            </Typography>
          </div>
        </div>

        {/* Content + Form */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16 2xl:gap-20 items-stretch">
          <ContactInfoSection />
          <ContactFormSection />
        </div>

        {/* Map */}
        <div className="mt-10 sm:mt-14 w-full rounded-[0.625rem] overflow-hidden shadow-sm relative">
          <iframe
            src="https://www.google.com/maps?cid=7749999751422969403&output=embed"
            width="100%"
            height="480"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="HCG Foundation Location"
            className="w-full h-[320px] sm:h-[300px] lg:h-[400px] block border-0"
          />
          <div className="absolute inset-0 pointer-events-none bg-[#E9C037] opacity-[0.17]" />
        </div>
      </section>
    </main>
  );
}