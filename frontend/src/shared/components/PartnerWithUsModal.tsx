"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Building2, MessageSquare } from "lucide-react";
import Typography from "@/lib/Typography";
import PhoneInputField from "@/shared/forms/PhoneInputField";

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#6C6048] hover:text-[#2E1C12] transition-colors rounded-full hover:bg-black/5"
          aria-label="Close modal"
        >
          <X className="size-5 sm:size-6" />
        </button>

        {/* Left Column: Form Content */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-none">
          <div>
            <div className="mb-2">
              <Typography variant="heading-5" as="h2" className="font-tiempos-headline font-normal italic text-[#2E1C12]">
                Be a Part of Someone&apos;s Cancer Journey
              </Typography>
            </div>
            <div className="mb-6">
              <Typography variant="body-8" as="p" className="font-manrope font-normal text-[#6C6048]">
                Share a few details and our team will get in touch with you to explore partnership opportunities.
              </Typography>
            </div>

            {submitted ? (
              <div className="my-8 p-6 bg-[#FFF9EA] border border-[#F3E3B6] rounded-lg text-center">
                <div className="mb-2">
                  <Typography variant="heading-3" as="h3" className="font-manrope font-medium text-[#2E1C12]">
                    Thank You!
                  </Typography>
                </div>
                <Typography variant="body-8" as="p" className="font-manrope font-normal text-[#6C6048]">
                  We have received your details and will get in touch shortly.
                </Typography>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <div
                    className={`flex items-center border-b py-2 transition-colors ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-[#E5E0D0] focus-within:border-[#FCCC2D]"
                    }`}
                  >
                    <User className="size-4 text-[#0D2838] shrink-0 mr-3" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name*"
                      value={formData.fullName}
                      onChange={handleNameChange}
                      className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                    />
                  </div>
                  {errors.fullName && (
                    <div className="mt-1">
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="font-manrope text-xs text-red-500"
                      >
                        {errors.fullName}
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="relative">
                  <div
                    className={`flex items-center border-b py-2 transition-colors ${
                      errors.email
                        ? "border-red-500"
                        : "border-[#E5E0D0] focus-within:border-[#FCCC2D]"
                    }`}
                  >
                    <Mail className="size-4 text-[#0D2838] shrink-0 mr-3" />
                    <input
                      type="email"
                      required
                      placeholder="Email Address*"
                      value={formData.email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-1">
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="font-manrope text-xs text-red-500"
                      >
                        {errors.email}
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Phone Number using standard PhoneInputField */}
                <PhoneInputField
                  label="Phone Number"
                  placeholder="Phone Number*"
                  hideLabel
                  required
                  value={formData.phone}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, phone: val || "" }))
                  }
                />

                {/* Organization Name (Optional) */}
                <div className="relative">
                  <div className="flex items-center border-b border-[#E5E0D0] py-2 focus-within:border-[#FCCC2D] transition-colors">
                    <Building2 className="size-4 text-[#0D2838] shrink-0 mr-3" />
                    <input
                      type="text"
                      placeholder="Organization Name (Optional)"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                    />
                  </div>
                </div>

                {/* Your Message */}
                <div className="relative">
                  <div className="flex items-start border-b border-[#E5E0D0] py-2 focus-within:border-[#FCCC2D] transition-colors">
                    <MessageSquare className="size-4 text-[#0D2838] shrink-0 mr-3 mt-1" />
                    <textarea
                      required
                      rows={2}
                      placeholder="Your Message*"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none"
                    />
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="modal-terms"
                    required
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeTerms: e.target.checked })
                    }
                    className="size-4 accent-[#FCCC2D] rounded-sm cursor-pointer"
                  />
                  <label
                    htmlFor="modal-terms"
                    className="cursor-pointer"
                  >
                    <Typography variant="caption-1" as="span" className="font-manrope font-normal text-[#6C6048]">
                      I have read and agree to the{" "}
                    </Typography>
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80 transition-opacity"
                    >
                      <Typography variant="caption-1" as="span" className="font-manrope font-medium text-[#D99A00]">
                        Terms & Conditions
                      </Typography>
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 px-6 bg-[#FCCC2D] text-[#382E07] rounded-lg shadow-xs transition duration-300 hover:bg-[#E9B510] hover:shadow-md cursor-pointer"
                >
                  <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#382E07]">
                    Submit
                  </Typography>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Hero Image Asset */}
        <div className="hidden md:block md:w-1/2 relative bg-[#FAF6EA]">
          <img
            src="/Get Involved/Partner With Us form/Partner With Us.png"
            alt="Be a Part of Someone's Cancer Journey"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
