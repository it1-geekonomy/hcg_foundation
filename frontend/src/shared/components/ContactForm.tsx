"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Typography from "@/lib/Typography";
import FormField from "@/shared/forms/FormField";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import FormSubmitButton from "@/shared/forms/FormSubmitButton";

export default function ContactForm({ className = "" }: { className?: string }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      // Prevent numbers from being entered into the Name field
      if (/\d/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          fullName: "Numbers are not allowed in name",
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }

    if (name === "email") {
      if (errors.email && emailRegex.test(value.trim())) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailBlur = () => {
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    } else if (formData.email.trim() && emailRegex.test(formData.email.trim())) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { fullName?: string; email?: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = "Numbers are not allowed in name";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFormSubmitted(true);
  };

  return (
    <div className={`w-full max-w-full lg:max-w-[34rem] rounded-[0.625rem] bg-[#FFF4D4] p-4 sm:p-5 lg:p-[1.25rem_1.75rem] border border-[#F3E3B6] flex flex-col items-start gap-2.5 sm:gap-3 ${className}`}>
      <div className="w-full">
        <Typography variant="heading-7" as="h2" className="font-manrope font-bold text-left text-[#505050]">
          Send Us a Message
        </Typography>
        <div className="mt-1">
          <Typography variant="body-8" as="p" className="font-manrope font-normal text-justify text-[#505050]">
            Have a question or would like to collaborate with us? Fill out the form below, and our team will get back to you as soon as possible.
          </Typography>
        </div>
      </div>

      {formSubmitted ? (
        <div className="mt-4 w-full flex flex-col items-center justify-center rounded-[0.625rem] bg-white p-5 sm:p-6 text-center border border-[#FDE599] my-auto">
          <CheckCircle2 className="size-11 sm:size-12 text-[#2E7D32]" />
          <div className="mt-3">
            <Typography variant="heading-8" as="h3" className="font-manrope font-bold text-[#382E07]">
              Message Sent Successfully!
            </Typography>
          </div>
          <div className="mt-1.5">
            <Typography variant="body-2" as="p" className="font-manrope font-normal text-[#5C5232]">
              Thank you for reaching out to HCG Foundation. We will respond to your message shortly.
            </Typography>
          </div>
          <button
            type="button"
            onClick={() => setFormSubmitted(false)}
            className="mt-5 rounded-md bg-[#FDC61D] px-6 py-2 transition hover:bg-[#E9B510] cursor-pointer"
          >
            <Typography variant="body-8" as="span" className="font-manrope font-semibold text-[#382E07]">
              Send Another Message
            </Typography>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-1 w-full flex flex-col gap-2.5 sm:gap-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3.5">
            <FormField
              label="Full Name"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
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
            onBlur={handleEmailBlur}
            error={errors.email}
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

          <FormSubmitButton className="!mt-1 !py-2.5 sm:!py-3">
            Submit Message
          </FormSubmitButton>
        </form>
      )}
    </div>
  );
}
