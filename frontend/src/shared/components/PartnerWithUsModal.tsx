"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Building2, MessageSquare } from "lucide-react";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import Typography from "@/lib/Typography";

interface PartnerWithUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerWithUsModal({
  isOpen,
  onClose,
}: PartnerWithUsModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
    agreeTerms: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    if (/\d/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        fullName: "Numbers are not allowed in name",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, fullName: undefined }));
    setFormData((prev) => ({ ...prev, fullName: val }));
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    if (errors.email && emailRegex.test(val.trim())) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    setFormData((prev) => ({ ...prev, email: val }));
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

  const handleAutoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
      setErrors({});
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        message: "",
        agreeTerms: false,
      });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        message: "",
        agreeTerms: false,
      });
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem] sm:p-[1.5rem] overflow-y-auto bg-black/60 backdrop-blur-[0.25rem] transition-opacity duration-300">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card Container (Frame 601: 709px x 815.35px -> 44.3125rem x 50.959rem on desktop, bg #FDF9F3) */}
      <div className="relative z-10 w-full max-w-[44.3125rem] bg-[#FDF9F3] rounded-[0.415rem] shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[calc(100dvh-2rem)] md:h-[50.959rem]">
        {/* Close Button placed at top right of the modal container */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[0.875rem] right-[0.875rem] sm:top-[1.25rem] sm:right-[1.25rem] z-30 size-[1.95rem] flex items-center justify-center text-[#596D79] hover:text-[#0D2838] transition-colors rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-[1.125rem] stroke-[2.2]" />
        </button>

        {/* Left Column: Form Content (Frame 603: Left: 47.64px -> 2.9775rem, Top: 38.77px -> 2.423rem, Bottom: 46.8px -> 2.925rem, Width: 309.08px -> 19.3175rem on desktop) */}
        <div className="relative w-full md:w-[22rem] shrink-0 px-[1.25rem] sm:px-0 sm:pl-[2.9775rem] sm:pr-[1.25rem] pt-[1.75rem] sm:pt-[2.423rem] pb-[1.75rem] sm:pb-[2.925rem] flex flex-col justify-between overflow-y-auto md:overflow-y-hidden min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div>
            {/* Frame 298: Title + Subtitle using design-system Typography */}
            <div className="w-full max-w-[17.0625rem]">
              <Typography
                variant="heading-5"
                as="h2"
                className="text-[#0D2838]"
              >
                Be a Part of Someone&apos;s
                <span className="block">Cancer Journey</span>
              </Typography>
              <Typography
                variant="caption-1"
                as="p"
                className="text-[#596D79] mt-[0.5rem]"
              >
                Share a few details and our team will get in touch with you to
                explore partnership opportunities.
              </Typography>
            </div>

            {submitted ? (
              <div className="my-[2rem] p-[1.5rem] bg-[#FFF9EA] border border-[#F3E3B6] rounded-[0.415rem] text-center w-full max-w-[17.0625rem]">
                <Typography
                  variant="heading-3"
                  as="h3"
                  className="text-[#2E1C12] mb-[0.5rem]"
                >
                  Thank You!
                </Typography>
                <Typography
                  variant="body-8"
                  as="p"
                  className="text-[#6C6048]"
                >
                  We have received your details and will get in touch shortly.
                </Typography>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-[17.0625rem]">
                {/* Inputs Group: Frame 560 fields with exact gap of 24px (1.5rem) on desktop */}
                <div className="flex flex-col gap-[1.25rem] sm:gap-[1.5rem] mt-[1.5rem] sm:mt-[1.875rem]">
                  {/* 1. Full Name (Auto-resizing textarea with dynamic underline) */}
                  <div className="relative">
                    <div
                      className={`${
                        formData.fullName.trim()
                          ? "min-h-[2.2rem] h-auto pb-[0.25rem]"
                          : "h-[2.53125rem] pb-[1.35rem]"
                      } flex items-start border-b transition-all ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-[#A3A3A3]/60 focus-within:border-[#FED034]"
                      }`}
                    >
                      <User className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem] mt-[0.125rem]" />
                      <textarea
                        rows={1}
                        required
                        placeholder="Full Name*"
                        value={formData.fullName}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          handleNameChange(e);
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none overflow-hidden"
                      />
                    </div>
                    {errors.fullName && (
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="text-red-500 mt-[0.25rem]"
                      >
                        {errors.fullName}
                      </Typography>
                    )}
                  </div>

                  {/* 2. Email Address (Auto-resizing textarea with dynamic underline) */}
                  <div className="relative">
                    <div
                      className={`${
                        formData.email.trim()
                          ? "min-h-[2.2rem] h-auto pb-[0.25rem]"
                          : "h-[2.53125rem] pb-[1.35rem]"
                      } flex items-start border-b transition-all ${
                        errors.email
                          ? "border-red-500"
                          : "border-[#A3A3A3]/60 focus-within:border-[#FED034]"
                      }`}
                    >
                      <Mail className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem] mt-[0.125rem]" />
                      <textarea
                        rows={1}
                        required
                        placeholder="Email Address*"
                        value={formData.email}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          handleEmailChange(e);
                          handleAutoResize(e);
                        }}
                        onBlur={handleEmailBlur}
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none overflow-hidden"
                      />
                    </div>
                    {errors.email && (
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="text-red-500 mt-[0.25rem]"
                      >
                        {errors.email}
                      </Typography>
                    )}
                  </div>

                  {/* 3. Phone Number (Frame 143: 273px x 49.5px -> 17.0625rem x 3.09375rem) */}
                  <div className="h-[3.09375rem]">
                    <PhoneInputField
                      label="Phone Number"
                      placeholder=""
                      hideLabel
                      required
                      containerClassName="!h-[3.09375rem] !pb-[0.25rem] !border-[#A3A3A3]/60 focus-within:!border-[#FED034]"
                      value={formData.phone}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, phone: val || "" }))
                      }
                    />
                  </div>

                  {/* 4. Organization Name (Optional) (Auto-resizing textarea with dynamic underline) */}
                  <div className="relative">
                    <div
                      className={`${
                        formData.organization.trim()
                          ? "min-h-[2.2rem] h-auto pb-[0.25rem]"
                          : "h-[2.53125rem] pb-[1.35rem]"
                      } flex items-start border-b border-[#A3A3A3]/60 focus-within:border-[#FED034] transition-all`}
                    >
                      <Building2 className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem] mt-[0.125rem]" />
                      <textarea
                        rows={1}
                        placeholder="Organization Name (Optional)"
                        value={formData.organization}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }));
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none overflow-hidden"
                      />
                    </div>
                  </div>

                  {/* 5. Your Message* (Auto-resizing textarea with generous empty gap and dynamic underline) */}
                  <div className="relative">
                    <div
                      className={`${
                        formData.message.trim()
                          ? "min-h-[2.5rem] h-auto pb-[0.25rem]"
                          : "h-[4.5rem] pb-[2.5rem]"
                      } flex items-start border-b border-[#A3A3A3]/60 focus-within:border-[#FED034] transition-all`}
                    >
                      <MessageSquare className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem] mt-[0.1875rem]" />
                      <textarea
                        rows={1}
                        required
                        placeholder="Your Message*"
                        value={formData.message}
                        onInput={handleAutoResize}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }));
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none overflow-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Section: Exact Figma 54px (3.375rem) gap on desktop, compact on mobile */}
                <div className="mt-[2rem] sm:mt-[3.375rem] flex flex-col gap-[0.875rem]">
                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-center gap-[0.5rem]">
                    <input
                      type="checkbox"
                      id="modal-terms"
                      required
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: e.target.checked,
                        }))
                      }
                      className="size-[0.9375rem] accent-[#FED034] rounded-[0.2rem] cursor-pointer shrink-0"
                    />
                    <label htmlFor="modal-terms" className="cursor-pointer">
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="text-[#596D79]"
                      >
                        I have read and agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#FED034] hover:opacity-80 transition-opacity font-medium"
                        >
                          Terms & Conditions
                        </a>
                      </Typography>
                    </label>
                  </div>

                  {/* Submit Button (Width: 100% on mobile, 272.95px -> 17.0625rem on desktop, Height: 49px -> 3.0625rem, #FED034) */}
                  <button
                    type="submit"
                    className="w-full sm:w-[17.0625rem] h-[3.0625rem] bg-[#FED034] text-[#292D32] rounded-[0.415rem] transition duration-200 hover:bg-[#E9BD26] cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Typography
                      variant="button-1"
                      as="span"
                      className="text-[#292D32]"
                    >
                      Submit
                    </Typography>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Hero Image Asset (358px x 815.35px -> 22.375rem x 50.959rem) */}
        <div className="hidden md:block w-[22.375rem] h-full relative shrink-0 bg-[#FDF9F3]">
          <img
            src="/Get Involved/Partner With Us form/Partner With Us.png"
            alt="Be a Part of Someone's Cancer Journey"
            className="w-full h-full object-cover object-left rounded-r-[0.415rem]"
          />
        </div>
      </div>
    </div>
  );
}
