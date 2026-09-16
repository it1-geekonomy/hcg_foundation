"use client";

import React from "react";
import { Phone, Mail, MapPin, ExternalLink, Navigation, Star } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import ContactForm from "@/shared/components/ContactForm";

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Phone Number",
    content: (
      <div className="mt-1">
        <Typography variant="body-8" as="p" className="text-[#3D382E]">
          +91 80 3366 9999
        </Typography>
      </div>
    ),
  },
  {
    icon: Mail,
    title: "Email",
    content: (
      <div className="mt-1">
        <Typography variant="body-8" as="p" className="text-[#3D382E]">
          hcgfoundation@gmail.com
        </Typography>
      </div>
    ),
  },
  {
    icon: MapPin,
    title: "Address",
    content: (
      <div className="mt-1">
        <Typography variant="body-8" as="p" className="text-[#3D382E]">
          Ground Floor, Tower Block
          <br />
          Unity Building Complex, Mission Road
          <br />
          Bangalore 560027, Karnataka, India
        </Typography>
      </div>
    ),
  },
];

export default function ClientContact() {
  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="w-full text-left">
          <Typography variant="heading-2" as="h1" className="text-[#2E1C12]">
            Let&apos;s Connect
          </Typography>
          <div className="mt-3 sm:mt-4 max-w-full lg:max-w-[68.75rem]">
            <Typography variant="body-8" as="p" className="text-[#6C6048]">
              Whether you&apos;re seeking patient support, exploring partnership
              opportunities, interested in volunteering, or simply have a
              question, we&apos;re here to help. Reach out to us, and our team
              will get back to you as soon as possible.
            </Typography>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          <div className="flex flex-col justify-between gap-6 lg:gap-0 lg:h-[32.481rem] lg:py-1 lg:col-span-5 w-full">
            {CONTACT_INFO.map((item, index) => (
              <div key={index} className="flex items-start gap-4 sm:gap-5">
                <div className="flex size-14 sm:size-15 shrink-0 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs">
                  <item.icon className="size-7 sm:size-8" />
                </div>
                <div className="flex flex-col">
                  <Typography variant="text-1" as="span" className="text-[#2E1C12]">
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

        <div className="relative mt-10 sm:mt-14 overflow-hidden rounded-[10px] border border-[#EFEAD8] bg-white shadow-xs">
          <div className="absolute top-4 left-4 z-10 hidden sm:block max-w-[16.25rem] rounded-lg bg-white/95 p-4 shadow-md backdrop-blur-xs border border-black/5 font-sans">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.75rem] text-[#2E1C12]">HCG Foundation</span>
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
            <p className="mt-1.5 text-[0.6875rem] leading-snug text-[#5F6368]">
              Ground Floor, Tower Block, UNITY BUILDING, Kalinga Rao Rd, Bengaluru, Karnataka 560027
            </p>
            <div className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[#5F6368]">
              <span className="font-bold text-[#E37400]">4.7</span>
              <div className="flex items-center text-[#F4B400]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </div>
              <span className="text-[#70757A] ml-0.5">(29)</span>
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
