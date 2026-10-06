"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Building2, MessageSquare } from "lucide-react";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import Typography from "@/lib/Typography";
import { participateApi } from "@/shared/lib/participate-api";

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

  interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
    agreeTerms?: string;
  }

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

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
      setSubmitting(false);
      setSubmitError("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitError("");

    const newErrors: FormErrors = {};

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

    const phoneVal = formData.phone.trim();
    let nationalDigits = "";
    let isIndia = true;
    if (phoneVal) {
      if (phoneVal.startsWith("+")) {
        const parts = phoneVal.split(" ");
        const dial = parts[0];
        isIndia = dial === "+91";
        nationalDigits = parts.slice(1).join("").replace(/\D/g, "");
      } else {
        nationalDigits = phoneVal.replace(/\D/g, "");
      }
    }

    if (!nationalDigits) {
      newErrors.phone = "Phone number is required";
    } else if (isIndia ? nationalDigits.length !== 10 : nationalDigits.length < 6) {
      newErrors.phone = isIndia
        ? "Please enter a 10-digit phone number"
        : "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Please agree to the Terms & Conditions";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await participateApi.submitPartnershipInquiry({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: phoneVal,
        organizationName: formData.organization.trim() || undefined,
        message: formData.message.trim(),
        termsAccepted: formData.agreeTerms,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
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
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[0.75rem] sm:p-[1.5rem] overflow-hidden bg-black/60 backdrop-blur-[0.25rem] transition-opacity duration-300">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card Container: locked and centered in viewport (does not move), matching ParticipateModal */}
      <div className="relative z-10 w-full max-w-[22.5rem] sm:max-w-[24rem] md:max-w-[44.3125rem] bg-[#FDF9F3] rounded-[0.415rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] md:max-h-[min(44rem,calc(100dvh-2rem))]">
        {/* Close Button placed at top right of the modal container */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[0.875rem] right-[0.875rem] sm:top-[1.25rem] sm:right-[1.25rem] z-30 size-[1.95rem] flex items-center justify-center text-[#596D79] hover:text-[#0D2838] transition-colors rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-[1.125rem] stroke-[2.2]" />
        </button>

        {/* Left Column: Form Content (scrollable when screen height is short, no scroll stick) */}
        <div className="relative w-full md:w-[22.3rem] px-[1.25rem] sm:px-[1.5rem] md:pl-[2.5rem] md:pr-[1rem] pt-[1.25rem] sm:pt-[1.5rem] md:pt-[1.75rem] pb-[2rem] sm:pb-[2.5rem] flex flex-col justify-start overflow-y-auto max-h-[calc(100dvh-2rem)] md:max-h-[min(42.5rem,calc(100dvh-2rem))] min-h-0 overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div>
            {/* Frame 298: Title + Subtitle using design-system Typography */}
            <div className="w-full max-w-[19.3175rem] mx-auto md:mx-0 space-y-[0.35rem] sm:space-y-[0.5rem]">
              <Typography
                variant="heading-5"
                as="h2"
                className="text-[#0D2838]"
              >
                <span className="block sm:whitespace-nowrap">
                  Be a Part of Someone&apos;s
                </span>
                <span className="block whitespace-nowrap">Cancer Journey</span>
              </Typography>

              <div className="w-full max-w-[17.794rem]">
                <Typography
                  variant="caption-1"
                  as="p"
                  className="text-[#596D79]"
                >
                  Share a few details and our team will get in touch with you to
                  explore partnership opportunities.
                </Typography>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="w-full max-w-[18.5625rem] mx-auto md:mx-0 pb-6 sm:pb-2">
              {/* Inputs Group: Frame 560 fields with balanced spacing */}
              <div className="flex flex-col gap-[0.75rem] sm:gap-[1.125rem] mt-[1rem] sm:mt-[1.5rem]">
                {/* 1. Full Name */}
                <div className="relative">
                  <div
                    className={`min-h-[2.85rem] h-auto pb-[0.25rem] flex flex-col justify-between border-b transition-all ${errors.fullName
                        ? "border-red-500"
                        : "border-[#A3A3A3]/60 focus-within:border-[#FED034]"
                      }`}
                  >
                    <label htmlFor="partner-fullName" className="flex items-center cursor-pointer">
                      <User className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem]" />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Full Name*
                      </Typography>
                    </label>
                    <div className="pl-[1.5rem] w-full">
                      <textarea
                        id="partner-fullName"
                        rows={1}
                        value={formData.fullName}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          handleNameChange(e);
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                      />
                    </div>
                  </div>
                  {errors.fullName && (
                    <div className="mt-[0.25rem]">
                      <span className="text-xs text-red-600 font-manrope block">
                        {errors.fullName}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Email Address */}
                <div className="relative">
                  <div
                    className={`min-h-[2.85rem] h-auto pb-[0.25rem] flex flex-col justify-between border-b transition-all ${errors.email
                        ? "border-red-500"
                        : "border-[#A3A3A3]/60 focus-within:border-[#FED034]"
                      }`}
                  >
                    <label htmlFor="partner-email" className="flex items-center cursor-pointer">
                      <Mail className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem]" />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Email Address*
                      </Typography>
                    </label>
                    <div className="pl-[1.5rem] w-full">
                      <textarea
                        id="partner-email"
                        rows={1}
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
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <div className="mt-[0.25rem]">
                      <span className="text-xs text-red-600 font-manrope block">
                        {errors.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Phone Number (Frame 143: 273px x 49.5px -> 17.0625rem x 3.09375rem) */}
                <div className="relative min-h-[3.09375rem] h-auto">
                  <PhoneInputField
                    label="Phone Number"
                    placeholder=""
                    hideLabel
                    required
                    error={errors.phone}
                    containerClassName={`!min-h-[3.09375rem] !h-auto !pb-[0.25rem] ${errors.phone
                        ? "!border-red-500"
                        : "!border-[#A3A3A3]/60 focus-within:!border-[#FED034]"
                      }`}
                    value={formData.phone}
                    onChange={(val) => {
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                      setFormData((prev) => ({ ...prev, phone: val || "" }));
                    }}
                  />
                </div>

                {/* 4. Organization Name (Optional) */}
                <div className="relative">
                  <div
                    className="min-h-[2.85rem] h-auto pb-[0.25rem] flex flex-col justify-between border-b border-[#A3A3A3]/60 focus-within:border-[#FED034] transition-all"
                  >
                    <label htmlFor="partner-organization" className="flex items-center cursor-pointer">
                      <Building2 className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem]" />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Organization Name (Optional)
                      </Typography>
                    </label>
                    <div className="pl-[1.5rem] w-full">
                      <textarea
                        id="partner-organization"
                        rows={1}
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
                        className="w-full bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Your Message* */}
                <div className="relative">
                  <div
                    className={`min-h-[4.5rem] h-auto pb-[0.25rem] flex flex-col justify-between border-b transition-all ${errors.message
                        ? "border-red-500"
                        : "border-[#A3A3A3]/60 focus-within:border-[#FED034]"
                      }`}
                  >
                    <label htmlFor="partner-message" className="flex items-center cursor-pointer pt-0.5">
                      <MessageSquare className="size-[0.875rem] text-[#0D2838] shrink-0 mr-[0.625rem]" />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Your Message*
                      </Typography>
                    </label>
                    <div className="pl-[1.5rem] w-full">
                      <textarea
                        id="partner-message"
                        rows={1}
                        maxLength={500}
                        value={formData.message}
                        onInput={handleAutoResize}
                        onChange={(e) => {
                          if (errors.message && e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, message: undefined }));
                          }
                          setFormData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }));
                          handleAutoResize(e);
                        }}
                        className="w-full min-h-[2.5rem] max-h-[7rem] bg-transparent text-[0.8125rem] leading-normal font-normal text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-y-auto block py-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <span className="text-xs text-red-600 font-manrope block">
                        {errors.message}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-[0.7rem] text-[#7C8B93] font-manrope select-none">
                      {formData.message.length} / 500
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Section: Terms and Submit Button */}
              <div className="mt-[0.875rem] sm:mt-[1.5rem] flex flex-col gap-[0.75rem]">
                {/* Terms and Conditions Checkbox (Figma Component 8: 297px x 18px -> 18.5625rem, gap: 4.5px -> 0.28125rem) */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-[0.28125rem] w-full">
                    <input
                      type="checkbox"
                      id="modal-terms"
                      checked={formData.agreeTerms}
                      onChange={(e) => {
                        if (errors.agreeTerms && e.target.checked) {
                          setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                        }
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: e.target.checked,
                        }));
                      }}
                      className="w-[1.03125rem] h-[1.03125rem] accent-[#FED034] rounded-[0.2rem] cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor="modal-terms"
                      className="cursor-pointer select-none whitespace-nowrap"
                    >
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-manrope font-medium text-[#7C8B93]"
                      >
                        I have read and agree to the{" "}
                      </Typography>
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-opacity"
                      >
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="font-manrope font-bold text-[#FED034]"
                        >
                          Terms & Conditions
                        </Typography>
                      </a>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <span className="text-xs text-red-600 font-manrope block">
                      {errors.agreeTerms}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitted || submitting}
                  aria-busy={submitting}
                  className="w-full mt-[0.35rem] sm:mt-[0.75rem] h-[2.75rem] sm:h-[3.0625rem] bg-[#FED034] text-[#292D32] rounded-[0.415rem] transition duration-200 hover:bg-[#E9BD26] cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  <Typography
                    variant="button-1"
                    as="span"
                    className="text-[#292D32]"
                  >
                    {submitted
                      ? "Submitted ✓"
                      : submitting
                        ? "Submitting…"
                        : "Submit"}
                  </Typography>
                </button>

                {submitError && !submitted && (
                  <div role="alert" className="text-center pt-2 animate-in fade-in duration-300">
                    <Typography
                      variant="caption-2"
                      as="p"
                      className="font-manrope font-semibold text-red-600"
                    >
                      {submitError}
                    </Typography>
                  </div>
                )}

                {submitted && (
                  <div className="text-center pt-2 space-y-0.5 animate-in fade-in duration-300">
                    <Typography
                      variant="caption-2"
                      as="p"
                      className="font-manrope font-semibold text-[#2E7D32]"
                    >
                      Message Sent Successfully!
                    </Typography>
                    <Typography
                      variant="caption-2"
                      as="p"
                      className="font-manrope font-normal text-[#2E7D32]"
                    >
                      Thank you for reaching out to HCG Foundation. We will respond
                      to your message shortly.
                    </Typography>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Image Asset */}
        <div className="hidden md:block w-[22.375rem] self-stretch relative shrink-0 bg-[#FDF9F3] overflow-hidden">
          <img
            src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791264498996-gkk4r-image-67.webp"
            alt="Be a Part of Someone's Cancer Journey"
            className="w-full h-full object-cover object-left rounded-r-[0.415rem]"
          />
        </div>
      </div>
    </div>
  );
}
