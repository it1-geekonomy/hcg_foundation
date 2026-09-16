"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, CheckCircle2, ExternalLink, Navigation, Star } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import FormField from "@/shared/forms/FormField";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import FormSubmitButton from "@/shared/forms/FormSubmitButton";

const CONTAINER = "max-w-[1200px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6";

export default function ClientContact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="w-full text-left">
          <h1
            style={{ textAlign: "left" }}
            className="font-serif text-2xl sm:text-3xl lg:text-4xl italic text-[#2E1C12] tracking-tight text-left font-normal"
          >
            Let&apos;s Connect
          </h1>
          <p className="mt-3 sm:mt-4 max-w-full lg:max-w-[1100px] font-manrope text-sm sm:text-base lg:text-[17px] leading-relaxed text-[#6C6048]">
            Whether you&apos;re seeking patient support, exploring partnership
            opportunities, interested in volunteering, or simply have a
            question, we&apos;re here to help. Reach out to us, and our team
            will get back to you as soon as possible.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          <div className="flex flex-col justify-between gap-6 lg:gap-0 lg:h-[519.7px] lg:py-1 lg:col-span-5 font-manrope w-full">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex size-14 sm:size-15 shrink-0 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs">
                <Phone className="size-7 sm:size-8" />
              </div>
              <div className="flex flex-col font-manrope">
                <span className="text-lg sm:text-xl font-bold text-[#2E1C12]">
                  Phone Number
                </span>
                <a
                  href="tel:+918033669999"
                  className="mt-1 text-lg sm:text-xl font-medium text-[#3D382E] transition hover:text-[#B88700]"
                >
                  +91 80 3366 9999
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5 font-manrope">
              <div className="flex size-14 sm:size-15 shrink-0 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs">
                <Mail className="size-7 sm:size-8" />
              </div>
              <div className="flex flex-col font-manrope">
                <span className="text-lg sm:text-xl font-bold text-[#2E1C12]">
                  Email
                </span>
                <a
                  href="mailto:hcgfoundation@gmail.com"
                  className="mt-1 text-lg sm:text-xl font-medium text-[#3D382E] transition hover:text-[#B88700]"
                >
                  hcgfoundation@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5 font-manrope">
              <div className="flex size-14 sm:size-15 shrink-0 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs">
                <MapPin className="size-7 sm:size-8" />
              </div>
              <div className="flex flex-col font-manrope">
                <span className="text-lg sm:text-xl font-bold text-[#2E1C12]">
                  Address
                </span>
                <p className="mt-1 text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-[#3D382E]">
                  Ground Floor, Tower Block
                  <br />
                  Unity Building Complex, Mission Road
                  <br />
                  Bangalore 560027, Karnataka, India
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 font-manrope w-full flex lg:justify-end">
            <div className="w-full max-w-full lg:max-w-[720px] min-h-[519.7px] rounded-[10px] bg-[#FFF4D4] p-6 sm:p-8 lg:p-[34px_41px] border border-[#F3E3B6] font-manrope flex flex-col justify-between items-start gap-4 lg:gap-[9.3px]">
              <div className="w-full">
                <h2 className="font-manrope text-2xl sm:text-3xl font-bold text-[#3D382E] tracking-tight">
                  Send Us a Message
                </h2>
                <p className="mt-2 font-manrope text-xs sm:text-sm text-[#706656] leading-relaxed">
                  Have a question or would like to collaborate with us? Fill out the form below, and our team will get back to you as soon as possible.
                </p>
              </div>

              {formSubmitted ? (
                <div className="mt-6 w-full flex flex-col items-center justify-center rounded-[10px] bg-white p-6 sm:p-8 text-center border border-[#FDE599] font-manrope my-auto">
                  <CheckCircle2 className="size-12 sm:size-14 text-[#2E7D32]" />
                  <h3 className="mt-4 font-manrope text-lg sm:text-xl font-bold text-[#382E07]">
                    Message Sent Successfully!
                  </h3>
                  <p className="mt-2 font-manrope text-xs sm:text-sm text-[#5C5232]">
                    Thank you for reaching out to HCG Foundation. We will respond to your message shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 font-manrope rounded-[6px] bg-[#FDC61D] px-6 py-2.5 text-sm sm:text-base font-semibold text-[#382E07] transition hover:bg-[#E9B510]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 w-full flex flex-col gap-4 sm:gap-5 font-manrope">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 font-manrope">
                    <FormField
                      label="Full Name"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                    />

                    <PhoneInputField
                      label="Phone Number"
                      required
                      value={formData.phone}
                      onChange={(val) => setFormData((prev) => ({ ...prev, phone: val || "" }))}
                    />
                  </div>

                  <FormField
                    label="Email Address"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />

                  <FormField
                    label="Your Message"
                    name="message"
                    required
                    isTextArea
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                  />

                  <FormSubmitButton>
                    Submit Message
                  </FormSubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-10 sm:mt-14 overflow-hidden rounded-[10px] border border-[#EFEAD8] bg-white shadow-xs">
          <div className="absolute top-4 left-4 z-10 hidden sm:block max-w-[260px] rounded-lg bg-white/95 p-4 shadow-md backdrop-blur-xs border border-black/5 font-sans">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#2E1C12]">HCG Foundation</span>
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
            <p className="mt-1.5 text-[11px] leading-snug text-[#5F6368]">
              Ground Floor, Tower Block, UNITY BUILDING, Kalinga Rao Rd, Bengaluru, Karnataka 560027
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#5F6368]">
              <span className="font-bold text-[#E37400]">4.7</span>
              <div className="flex items-center text-[#F4B400]">
                <Star className="size-3 fill-current" />
                <Star className="size-3 fill-current" />
                <Star className="size-3 fill-current" />
                <Star className="size-3 fill-current" />
                <Star className="size-3 fill-current" />
              </div>
              <span className="text-[#70757A] ml-0.5">(29)</span>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 lg:h-[420px] w-full">
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
