"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, CheckCircle2, ExternalLink, Navigation, Star } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import FormField from "@/shared/forms/FormField";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import FormSubmitButton from "@/shared/forms/FormSubmitButton";

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Phone Number",
    content: (
      <a
        href="tel:+918033669999"
        className="mt-1 text-[1.125rem] sm:text-[1.25rem] font-medium text-[#3D382E] transition hover:text-[#B88700]"
      >
        +91 80 3366 9999
      </a>
    ),
  },
  {
    icon: Mail,
    title: "Email",
    content: (
      <a
        href="mailto:hcgfoundation@gmail.com"
        className="mt-1 text-[1.125rem] sm:text-[1.25rem] font-medium text-[#3D382E] transition hover:text-[#B88700]"
      >
        hcgfoundation@gmail.com
      </a>
    ),
  },
  {
    icon: MapPin,
    title: "Address",
    content: (
      <Typography variant="body-8" as="p" className="mt-1 text-[1rem] sm:text-[1.125rem] lg:text-[1.25rem] font-medium leading-relaxed text-[#3D382E]">
        Ground Floor, Tower Block
        <br />
        Unity Building Complex, Mission Road
        <br />
        Bangalore 560027, Karnataka, India
      </Typography>
    ),
  },
];

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
          <Typography
            variant="heading-2"
            as="h1"
            className="font-serif text-[1.5rem] sm:text-[1.875rem] lg:text-[2.25rem] text-[#2E1C12] tracking-tight"
          >
            Let&apos;s Connect
          </Typography>
          <Typography
            variant="body-8"
            as="p"
            className="mt-3 sm:mt-4 max-w-full lg:max-w-[68.75rem] text-[0.875rem] sm:text-[1rem] lg:text-[1.0625rem] leading-relaxed text-[#6C6048]"
          >
            Whether you&apos;re seeking patient support, exploring partnership
            opportunities, interested in volunteering, or simply have a
            question, we&apos;re here to help. Reach out to us, and our team
            will get back to you as soon as possible.
          </Typography>
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
            <div className="w-full max-w-full lg:max-w-[45rem] min-h-[32.481rem] rounded-[10px] bg-[#FFF4D4] p-6 sm:p-8 lg:p-[2.125rem_2.5625rem] border border-[#F3E3B6] flex flex-col justify-between items-start gap-4 lg:gap-[0.581rem]">
              <div className="w-full">
                <Typography variant="heading-7" as="h2" className="text-[1.5rem] sm:text-[1.875rem] font-bold text-[#3D382E] tracking-tight">
                  Send Us a Message
                </Typography>
                <Typography variant="body-8" as="p" className="mt-2 text-[0.75rem] sm:text-[0.875rem] text-[#706656] leading-relaxed">
                  Have a question or would like to collaborate with us? Fill out the form below, and our team will get back to you as soon as possible.
                </Typography>
              </div>

              {formSubmitted ? (
                <div className="mt-6 w-full flex flex-col items-center justify-center rounded-[10px] bg-white p-6 sm:p-8 text-center border border-[#FDE599] my-auto">
                  <CheckCircle2 className="size-12 sm:size-14 text-[#2E7D32]" />
                  <Typography variant="heading-3" as="h3" className="mt-4 text-[1.125rem] sm:text-[1.25rem] font-bold text-[#382E07]">
                    Message Sent Successfully!
                  </Typography>
                  <Typography variant="body-2" as="p" className="mt-2 text-[0.75rem] sm:text-[0.875rem] text-[#5C5232]">
                    Thank you for reaching out to HCG Foundation. We will respond to your message shortly.
                  </Typography>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 rounded-[6px] bg-[#FDC61D] px-6 py-2.5 text-[0.875rem] sm:text-[1rem] font-semibold text-[#382E07] transition hover:bg-[#E9B510]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 w-full flex flex-col gap-4 sm:gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
          <div className="absolute top-4 left-4 z-10 hidden sm:block max-w-[16.25rem] rounded-lg bg-white/95 p-4 shadow-md backdrop-blur-xs border border-black/5 font-sans">
            <div className="flex items-center justify-between gap-2">
              <Typography variant="text-1" as="span" className="text-[0.75rem] text-[#2E1C12]">HCG Foundation</Typography>
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
            <Typography variant="body-8" as="p" className="mt-1.5 text-[0.6875rem] leading-snug text-[#5F6368]">
              Ground Floor, Tower Block, UNITY BUILDING, Kalinga Rao Rd, Bengaluru, Karnataka 560027
            </Typography>
            <div className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[#5F6368]">
              <Typography variant="body-8" as="span" className="font-bold text-[#E37400]">4.7</Typography>
              <div className="flex items-center text-[#F4B400]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </div>
              <Typography variant="body-8" as="span" className="text-[#70757A] ml-0.5">(29)</Typography>
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
