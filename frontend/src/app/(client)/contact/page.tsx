"use client";

import React from "react";
import { ExternalLink, Navigation, Star } from "lucide-react";
import { CONTACT_INFO } from "@/domains/contact/constants/contact";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import ContactForm from "@/shared/components/ContactForm";
import Banner from "@/shared/components/Herobannersection";

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

export default function ClientContact() {
  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <Banner
        bgImage="/Contact us/Contact Us banner image.png"
        bgImageAlt="Contact Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
        title="Contact Us"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="w-full text-left">
          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Let&apos;s Connect
          </Typography>
          <div className="mt-3 sm:mt-4 max-w-full lg:max-w-[68.75rem]">
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              Whether you&apos;re seeking patient support, exploring partnership
              opportunities, interested in volunteering, or simply have a
              question, we&apos;re here to help. Reach out to us, and our team
              will get back to you as soon as possible.
            </Typography>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start lg:items-stretch">
          <div className="flex flex-col justify-between gap-[1.5rem] lg:gap-0 lg:h-full lg:col-span-5 w-full">
            {CONTACT_INFO.map((item, index) => (
              <div key={index} className="flex items-start gap-4 sm:gap-5">
                <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs">
                  <item.icon className="size-7 sm:size-8" />
                </div>
                <div className="flex flex-col">
                  <Typography
                    variant="body-2"
                    as="span"
                    className="font-argestadisplay font-normal text-left text-[#0D2838]"
                  >
                    {item.title}
                  </Typography>
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 w-full flex lg:justify-end">
            <ContactForm />
          </div>
        </div>

        <div className="relative mt-10 sm:mt-14 overflow-hidden rounded-[0.625rem] border border-[#EFEAD8] bg-white shadow-xs">
          <div className="absolute top-4 left-4 z-10 hidden sm:block max-w-[16.25rem] rounded-lg bg-white/95 p-4 shadow-md backdrop-blur-xs border border-black/5">
            <div className="flex items-center justify-between gap-2">
              <Typography variant="body-8" as="span" className="font-manrope font-semibold text-[#2E1C12]">
                HCG Foundation
              </Typography>
              <div className="flex items-center gap-2">
                <a
                  href="https://maps.google.com/?q=HCG+Foundation+Unity+Building+Mission+Road+Bangalore"
                  target="_blank"
                  rel="noreferrer"
                  title="Open in Google Maps"
                  className="text-[#1A73E8] hover:text-[#1557B0] transition"
                >
                  <ExternalLink className="size-4" />
                </a>
                <a
                  href="https://www.google.com/maps/dir//HCG+Foundation+Unity+Building+Mission+Road+Bangalore"
                  target="_blank"
                  rel="noreferrer"
                  title="Get Directions"
                  className="text-[#1A73E8] hover:text-[#1557B0] transition"
                >
                  <Navigation className="size-4" />
                </a>
              </div>
            </div>
            <div className="mt-1.5">
              <Typography variant="body-8" as="p" className="font-manrope font-normal text-[#5F6368]">
                Ground Floor, Tower Block, UNITY BUILDING, Kalinga Rao Rd, Bengaluru, Karnataka 560027
              </Typography>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[#5F6368]">
              <Typography variant="caption-1" as="span" className="font-manrope font-semibold text-[#E37400]">
                4.7
              </Typography>
              <div className="flex items-center text-[#F4B400]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </div>
              <Typography variant="caption-1" as="span" className="font-manrope font-normal text-[#70757A] ml-0.5">
                (29)
              </Typography>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 lg:h-[26.25rem] w-full">
            <iframe
              title="HCG Foundation Location Map"
              src="https://maps.google.com/maps?q=12.9698501,77.5936838&z=14&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
