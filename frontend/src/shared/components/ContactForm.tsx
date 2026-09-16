"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Typography from "@/lib/Typography";
import FormField from "@/shared/forms/FormField";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import FormSubmitButton from "@/shared/forms/FormSubmitButton";

export default function ContactForm() {
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
    <div className="w-full max-w-full lg:max-w-[45rem] min-h-[32.481rem] rounded-[10px] bg-[#FFF4D4] p-6 sm:p-8 lg:p-[2.125rem_2.5625rem] border border-[#F3E3B6] flex flex-col justify-between items-start gap-4 lg:gap-[0.581rem]">
      <div className="w-full">
        <Typography variant="heading-7" as="h2" className="text-[#3D382E]">
          Send Us a Message
        </Typography>
        <div className="mt-2">
          <Typography variant="body-8" as="p" className="text-[#706656]">
            Have a question or would like to collaborate with us? Fill out the form below, and our team will get back to you as soon as possible.
          </Typography>
        </div>
      </div>

      {formSubmitted ? (
        <div className="mt-6 w-full flex flex-col items-center justify-center rounded-[10px] bg-white p-6 sm:p-8 text-center border border-[#FDE599] my-auto">
          <CheckCircle2 className="size-12 sm:size-14 text-[#2E7D32]" />
          <div className="mt-4">
            <Typography variant="heading-8" as="h3" className="text-[#382E07]">
              Message Sent Successfully!
            </Typography>
          </div>
          <div className="mt-2">
            <Typography variant="body-2" as="p" className="text-[#5C5232]">
              Thank you for reaching out to HCG Foundation. We will respond to your message shortly.
            </Typography>
          </div>
          <button
            type="button"
            onClick={() => setFormSubmitted(false)}
            className="mt-6 rounded-[6px] bg-[#FDC61D] px-6 py-2.5 text-[0.875rem] sm:text-[1rem] font-semibold text-[#382E07] transition hover:bg-[#E9B510] cursor-pointer"
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
  );
}
