"use client";

import React, { useState } from "react";
import Typography from "@/lib/Typography";
import CountrySelect from "@/shared/components/CountrySelect";
import {
  getDonationCountry,
  isIndiaCountry,
} from "@/domains/home/constants/countries";

// NOTE: adjust this to the exact Figma hex if it differs — closest
// warm-cream card tone matched from the reference screenshots.
const FORM_BG = "#FFF1CB";

const MESSAGE_MAX_LENGTH = 500;

const LABEL_CLASS = "font-manrope font-semibold text-[#505050]";
const INPUT_CLASS =
  "w-full bg-transparent border-0 border-b border-[#505050] focus:outline-none focus:border-b-2 py-1.5 text-[#505050] font-manrope text-[13px] sm:text-sm";

const TypographyField = Typography as unknown as React.ComponentType<
  Record<string, unknown>
>;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  message?: string;
}

function nationalPhoneDigits(value: string, dialCode: string) {
  let digits = value.replace(/\D/g, "");
  const dialDigits = dialCode.replace(/\D/g, "");
  if (
    dialDigits &&
    digits.startsWith(dialDigits) &&
    digits.length > dialDigits.length
  ) {
    digits = digits.slice(dialDigits.length);
  }
  const maxNational = Math.max(6, 15 - dialDigits.length);
  return digits.slice(0, maxNational);
}

export default function ContactFormSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN");

  const country = getDonationCountry(selectedCountryCode);
  const international = !isIndiaCountry(selectedCountryCode);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fullName") {
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

    if (name === "message") {
      if (value.length > MESSAGE_MAX_LENGTH) return;
      if (errors.message && value.trim()) {
        setErrors((prev) => ({ ...prev, message: undefined }));
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
    } else if (
      formData.email.trim() &&
      emailRegex.test(formData.email.trim())
    ) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = "Numbers are not allowed in name";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    const national = nationalPhoneDigits(formData.phone, country.dial);
    if (!national.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (international ? national.length < 6 : national.length !== 10) {
      newErrors.phone = international
        ? "Please enter a valid phone number"
        : "Please enter a 10-digit phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFormSubmitted(true);
  };

  return (
    <div className="lg:col-span-8 w-full lg:h-full lg:flex lg:justify-end">
      <div
        className="w-full lg:max-w-[40rem] xl:max-w-[46rem] 2xl:max-w-[50rem] h-full flex flex-col rounded-[0.625rem] p-5 sm:p-6 lg:p-8"
        style={{ backgroundColor: FORM_BG }}
      >
        <Typography
          variant="heading-10"
          as="h2"
          className="font-manrope font-bold !text-left text-[#505050]"
        >
          Send Us a Message
        </Typography>

        <div className="mt-2 sm:mt-4 w-full lg:max-w-[32rem]">
          <Typography
            variant="body-8"
            as="p"
            className="font-manrope font-normal text-left text-black/44"
          >
            Have a question or would like to collaborate with us? Fill out
            the form below, and our team will get back to you as soon as
            possible.
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-4 sm:mt-8 w-full flex-1 flex flex-col gap-4 sm:gap-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col gap-1.5">
              <TypographyField
                variant="body-8"
                as="label"
                htmlFor="fullName"
                className={LABEL_CLASS}
              >
                Full Name<span className="text-[#505050]">*</span>
              </TypographyField>
              <TypographyField
                variant="body-8"
                as="input"
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                aria-invalid={!!errors.fullName}
                className={INPUT_CLASS}
              />
              {errors.fullName && (
                <span className="text-xs text-red-600">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <TypographyField
                variant="body-8"
                as="label"
                htmlFor="phone"
                className={LABEL_CLASS}
              >
                Phone Number<span className="text-[#505050]">*</span>
              </TypographyField>
              <div className="flex items-center border-b border-[#505050]">
                <CountrySelect
                  value={selectedCountryCode}
                  onChange={(nextCode) => {
                    setSelectedCountryCode(nextCode);
                    setFormData((prev) => ({ ...prev, phone: "" }));
                  }}
                  variant="dial"
                />
                <TypographyField
                  variant="body-8"
                  as="input"
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setErrors((prev) => ({
                      ...prev,
                      phone: undefined,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      phone: nationalPhoneDigits(
                        e.target.value,
                        country.dial
                      ),
                    }));
                  }}
                  aria-invalid={!!errors.phone}
                  className="min-w-0 flex-1 bg-transparent border-0 focus:outline-none py-1.5 text-[#505050]"
                />
              </div>
              {errors.phone && (
                <span className="text-xs text-red-600">{errors.phone}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <TypographyField
              variant="body-8"
              as="label"
              htmlFor="email"
              className={LABEL_CLASS}
            >
              Email Address<span className="text-[#505050]">*</span>
            </TypographyField>
            <TypographyField
              variant="body-8"
              as="input"
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              aria-invalid={!!errors.email}
              className={INPUT_CLASS}
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <TypographyField
                variant="body-8"
                as="label"
                htmlFor="message"
                className={LABEL_CLASS}
              >
                Your Message<span className="text-[#505050]">*</span>
              </TypographyField>
              <Typography
                variant="caption-1"
                as="span"
                className="font-manrope text-[#505050]/60"
              >
                {formData.message.length}/{MESSAGE_MAX_LENGTH}
              </Typography>
            </div>
            <TypographyField
              variant="body-8"
              as="textarea"
              id="message"
              name="message"
              rows={2}
              required
              maxLength={MESSAGE_MAX_LENGTH}
              value={formData.message}
              onChange={handleChange}
              aria-invalid={!!errors.message}
              className={`${INPUT_CLASS} resize-none`}
            />
            {errors.message && (
              <span className="text-xs text-red-600">{errors.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full max-w-[340px] mx-auto lg:max-w-none lg:mx-0 lg:w-full rounded-md bg-[#FCCC2D] py-3 cursor-pointer"
          >
            <Typography
              variant="body-8"
              as="span"
              className="font-manrope font-semibold text-[#505050]"
            >
              Submit Message
            </Typography>
          </button>

          {formSubmitted && (
            <div className="text-center">
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
        </form>
      </div>
    </div>
  );
}