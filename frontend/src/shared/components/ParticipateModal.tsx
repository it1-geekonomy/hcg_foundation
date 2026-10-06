"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  BookOpen,
  MapPin,
  Globe,
  Laptop,
  MessageSquare,
  Award,
  Target,
  ChevronDown,
  FileText,
  Wrench,
  Trash2,
} from "lucide-react";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import SearchableLanguageSelect from "@/shared/forms/SearchableLanguageSelect";
import LocationSelect from "@/shared/forms/LocationSelect";
import VolunteerInterestSelect from "@/shared/forms/VolunteerInterestSelect";
import GenderSelect from "@/shared/forms/GenderSelect";
import DobDatePicker from "@/shared/forms/DobDatePicker";
import Typography from "@/lib/Typography";
import { participateApi } from "@/shared/lib/participate-api";

const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Out of flow so an error never stretches its field or the paired field in the same row. */
const FIELD_ERROR_CLASS =
  "pointer-events-none absolute left-0 right-0 top-full mt-0.5 block text-xs leading-3.5 text-red-600 font-manrope";

/** DD/MM/YYYY → YYYY-MM-DD (API format); undefined when incomplete/invalid. */
function toIsoDate(value: string): string | undefined {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return undefined;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeAmount(value: string) {
  return value.replace(/[,\s₹]/g, "");
}

export type ParticipateModalType = "intern" | "fundraise" | "volunteer" | null;

interface ParticipateModalProps {
  isOpen: boolean;
  type: ParticipateModalType;
  onClose: () => void;
}

export default function ParticipateModal({
  isOpen,
  type,
  onClose,
}: ParticipateModalProps) {
  interface FormErrors {
    fullName?: string;
    phone?: string;
    email?: string;
    gender?: string;
    course?: string;
    address?: string;
    languages?: string;
    computerSkills?: string;
    resumeFile?: string;
    location?: string;
    educationalQualification?: string;
    volunteerInterest?: string;
    whyVolunteer?: string;
    fundraisingGoal?: string;
    reason?: string;
    message?: string;
    agreeTerms?: string;
  }

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    course: "",
    address: "",
    languages: "",
    computerSkills: "",
    location: "",
    educationalQualification: "",
    fundraisingGoal: "",
    reason: "",
    volunteerInterest: "",
    availability: "",
    whyVolunteer: "",
    message: "",
    agreeTerms: false,
  });

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleViewResume = () => {
    if (!resumeFile) return;
    const fileUrl = URL.createObjectURL(resumeFile);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Fresh clean state every time modal is opened
      setSubmitted(false);
      setSubmitting(false);
      setSuccessMessage("");
      setSubmitError("");
      setErrors({});
      setResumeFile(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        gender: "",
        dob: "",
        course: "",
        address: "",
        languages: "",
        computerSkills: "",
        location: "",
        educationalQualification: "",
        fundraisingGoal: "",
        reason: "",
        volunteerInterest: "",
        availability: "",
        whyVolunteer: "",
        message: "",
        agreeTerms: false,
      });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, type]);

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

  const isIntern = type === "intern";
  const isFundraise = type === "fundraise";
  const isVolunteer = type === "volunteer";

  if (!isOpen || !type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitError("");

    const newErrors: FormErrors = {};

    // Common: Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = "Numbers are not allowed in name";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Common: Phone Number
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

    // Common: Email Address
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Specific to Intern
    if (isIntern) {
      if (!formData.gender.trim()) {
        newErrors.gender = "Please select your gender";
      }
      if (!formData.course.trim()) {
        newErrors.course = "Current course is required";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
      if (!formData.languages.trim()) {
        newErrors.languages = "Please select languages known";
      }
      if (!formData.computerSkills.trim()) {
        newErrors.computerSkills = "Skills are required";
      }
      if (!resumeFile) {
        newErrors.resumeFile = "Please attach your resume";
      } else if (!RESUME_TYPES.has(resumeFile.type)) {
        newErrors.resumeFile = "Resume must be a PDF, DOC, or DOCX file";
      } else if (resumeFile.size > MAX_RESUME_BYTES) {
        newErrors.resumeFile = "Resume must be 5 MB or smaller";
      }
    }

    // Specific to Volunteer
    if (isVolunteer) {
      if (!formData.location.trim()) {
        newErrors.location = "City / Location is required";
      }
      if (!formData.educationalQualification.trim()) {
        newErrors.educationalQualification = "Educational qualification is required";
      }
      if (!formData.volunteerInterest.trim()) {
        newErrors.volunteerInterest = "Please select areas of interest";
      }
      if (!(formData.whyVolunteer || formData.message).trim()) {
        newErrors.whyVolunteer = "This field is required";
      }
    }

    // Specific to Fundraise
    if (isFundraise) {
      if (!formData.location.trim()) {
        newErrors.location = "City / Location is required";
      }
      const goal = normalizeAmount(formData.fundraisingGoal);
      if (!goal) {
        newErrors.fundraisingGoal = "Fundraising goal is required";
      } else if (!/^\d+(\.\d{1,2})?$/.test(goal) || Number(goal) <= 0) {
        newErrors.fundraisingGoal = "Please enter a valid amount (e.g. 50000)";
      }
      if (!formData.reason.trim()) {
        newErrors.reason = "Please enter why you are fundraising";
      }
      if (!formData.message.trim()) {
        newErrors.message = "Message is required";
      }
    }

    // Common: Terms & Conditions
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Please agree to the Terms & Conditions";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const compactPhone = phoneVal.replace(/\s+/g, "");

    let message = "";
    try {
      if (isFundraise) {
        const res = await participateApi.submitFundraisingCampaign({
          fullName,
          phoneNumber: phoneVal,
          email,
          city: formData.location.trim(),
          fundraisingGoal: normalizeAmount(formData.fundraisingGoal),
          fundraisingReason: formData.reason.trim(),
          message: formData.message.trim() || undefined,
          termsAccepted: formData.agreeTerms,
        });
        message = res.message;
      } else if (isVolunteer) {
        const res = await participateApi.submitVolunteer({
          fullName,
          phone: compactPhone,
          email,
          cityLocation: formData.location.trim(),
          educationalQualification: formData.educationalQualification.trim(),
          areasOfInterest: formData.volunteerInterest.trim(),
          reason: (formData.whyVolunteer || formData.message).trim(),
          termsAccepted: formData.agreeTerms,
        });
        message = res.message;
      } else if (isIntern && resumeFile) {
        const res = await participateApi.submitInternship({
          fullName,
          phone: compactPhone,
          email,
          gender: formData.gender.trim() || undefined,
          dob: toIsoDate(formData.dob),
          currentCourse: formData.course.trim() || undefined,
          address: formData.address.trim() || undefined,
          languages: formData.languages.trim() || undefined,
          computerSkills: formData.computerSkills.trim() || undefined,
          termsAccepted: formData.agreeTerms,
          cv: resumeFile,
        });
        message = res.message;
      }
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
    setSuccessMessage(message || "Application Submitted Successfully!");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSuccessMessage("");
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        gender: "",
        dob: "",
        course: "",
        address: "",
        languages: "",
        computerSkills: "",
        location: "",
        educationalQualification: "",
        fundraisingGoal: "",
        reason: "",
        volunteerInterest: "",
        availability: "",
        whyVolunteer: "",
        message: "",
        agreeTerms: false,
      });
      setResumeFile(null);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Container with exact Figma styling: width 640px (40rem), height 860px (53.75rem) for Intern (Frame 556), 736px (46rem) for Fundraise/Volunteer */}
      <div
        className={`relative z-10 w-full max-w-[40rem] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] ${isIntern
          ? "h-auto sm:h-[53.75rem] rounded-[0.625rem]"
          : "h-auto sm:h-[46rem] rounded-[0.625rem]"
          }`}
      >
        {/* Full Modal Watermark Background Image matching Figma */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none"
          style={{
            backgroundImage: `url('https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791265188879-ilf9y-group-1000006354.webp')`,
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 p-2 text-[#6C6048] hover:text-[#2E1C12] transition-colors rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5 sm:size-6" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-6 sm:px-12 sm:py-9 overflow-y-auto h-full flex flex-col justify-between overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Header Title & Subtitle matching Figma 100% */}
          <div className="text-center mx-auto mb-6 sm:mb-8">
            <div className="mb-1">
              <h2 className="font-tiempos-headline font-normal italic text-[#0D2838] text-[1.4275rem] leading-[100%] tracking-[0.03em] text-center">
                {isIntern && "Apply for Internship at"}
                {isFundraise && "Start a Fundraising Campaign at"}
                {!isIntern && !isFundraise && "Become a Volunteer at"}
              </h2>
            </div>
            <div className="mb-3">
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, #208CCC 0%, #FABE3B 50%, #9D0037 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                className="font-manrope font-bold text-[1.4275rem] leading-[100%] tracking-[0.01em] inline-block text-center select-none"
              >
                HCG Foundation
              </span>
            </div>
            <div
              className={`${isFundraise
                ? "w-full max-w-[26.125rem]"
                : isVolunteer
                  ? "w-full max-w-[18.6875rem]"
                  : "w-full max-w-[28.125rem]"
                } mx-auto`}
            >
              <p className="font-manrope font-normal text-[0.677rem] leading-[150%] tracking-[0.01em] text-[#596D79] text-center">
                {isIntern && (
                  <>
                    Passionate about making a difference? Join the HCG Foundation Internship Program to gain hands-on experience, learn from experts, and build skills for your future career.
                  </>
                )}
                {isFundraise && (
                  <>
                    Turn your network into meaningful support for cancer patients and families. Fill in the details below to start your fundraising journey with us.
                  </>
                )}
                {isVolunteer && (
                  <>
                    &ldquo;Share your time, skills, and energy to support cancer patients, families, and communities.&rdquo;
                  </>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="w-full max-w-[34rem] mx-auto flex-1 flex flex-col justify-between font-manrope space-y-4 sm:space-y-5">
            {/* Row 1: Full Name & Phone Number (Figma Frame 560: 544.45px x 41.14px, Gap: 51px) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
              <div className="relative">
                <div
                  className={`min-h-[2.85rem] h-auto pb-1 flex flex-col justify-between border-b transition-all ${errors.fullName
                    ? "border-red-500"
                    : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                >
                  <label htmlFor="participate-fullName" className="flex items-center cursor-pointer">
                    <img
                      src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791267846107-gluso-user-2x.webp"
                      alt=""
                      className="size-4 shrink-0 mr-3 object-contain"
                    />
                    <Typography
                      variant="caption-1"
                      as="span"
                      className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                    >
                      Full Name*
                    </Typography>
                  </label>
                  <div className="pl-7 w-full">
                    <textarea
                      id="participate-fullName"
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
                      className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                    />
                  </div>
                </div>
                {errors.fullName && (
                  <span className={FIELD_ERROR_CLASS}>{errors.fullName}</span>
                )}
              </div>

              <div className="relative min-h-[2.85rem] h-auto">
                <PhoneInputField
                  label="Phone Number"
                  hideLabel
                  floatingError
                  required
                  error={errors.phone}
                  value={formData.phone}
                  onChange={(val) => {
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                    setFormData((prev) => ({ ...prev, phone: val || "" }));
                  }}
                />
              </div>
            </div>

            {/* Row 2: Email & Gender (Intern) / Location (Fundraise/Volunteer) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
              <div className="relative h-full">
                <div
                  className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.email
                    ? "border-red-500"
                    : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                >
                  <label htmlFor="participate-email" className="flex items-center cursor-pointer">
                    <img
                      src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791268404784-fpux5-sms.webp"
                      alt=""
                      className="size-4 shrink-0 mr-3 object-contain"
                    />
                    <Typography
                      variant="caption-1"
                      as="span"
                      className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                    >
                      Email Address*
                    </Typography>
                  </label>
                  <div className="pl-7 w-full">
                    <textarea
                      id="participate-email"
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
                      className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                    />
                  </div>
                </div>
                {errors.email && (
                  <span className={FIELD_ERROR_CLASS}>{errors.email}</span>
                )}
              </div>

              {isIntern ? (
                <GenderSelect
                  value={formData.gender}
                  error={errors.gender}
                  onChange={(val) => {
                    if (errors.gender) {
                      setErrors((prev) => ({ ...prev, gender: undefined }));
                    }
                    setFormData((prev) => ({ ...prev, gender: val }));
                  }}
                  className="h-full"
                />
              ) : (
                <LocationSelect
                  value={formData.location}
                  error={errors.location}
                  onChange={(val) => {
                    if (errors.location) {
                      setErrors((prev) => ({ ...prev, location: undefined }));
                    }
                    setFormData((prev) => ({ ...prev, location: val }));
                  }}
                  className="h-full"
                />
              )}
            </div>

            {/* Row 3 (Specific to Intern vs Fundraise/Volunteer) */}
            {isIntern ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <DobDatePicker
                    value={formData.dob}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, dob: val }))
                    }
                    className="h-full"
                  />

                  <div className="relative h-full">
                    <div
                      className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.course
                        ? "border-red-500"
                        : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                        }`}
                    >
                      <label htmlFor="participate-course" className="flex items-center cursor-pointer">
                        <img
                          src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791269059713-dt428-book.webp"
                          alt=""
                          className="size-4 shrink-0 mr-3 object-contain"
                        />
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                        >
                          Current Course*
                        </Typography>
                      </label>
                      <div className="pl-7 w-full">
                        <textarea
                          id="participate-course"
                          rows={1}
                          value={formData.course}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
                            if (errors.course && e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, course: undefined }));
                            }
                            setFormData({ ...formData, course: e.target.value });
                            handleAutoResize(e);
                          }}
                          className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                        />
                      </div>
                    </div>
                    {errors.course && (
                      <span className={FIELD_ERROR_CLASS}>{errors.course}</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="relative">
                  <div
                    className={`min-h-[2.85rem] h-auto pb-1 flex flex-col justify-between border-b transition-all ${errors.address
                      ? "border-red-500"
                      : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <label htmlFor="participate-address" className="flex items-center cursor-pointer">
                      <img
                        src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791269187397-m4u96-location.webp"
                        alt=""
                        className="size-4 shrink-0 mr-3 object-contain"
                      />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Your Address*
                      </Typography>
                    </label>
                    <div className="pl-7 w-full">
                      <textarea
                        id="participate-address"
                        rows={1}
                        value={formData.address}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          if (errors.address && e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, address: undefined }));
                          }
                          setFormData({ ...formData, address: e.target.value });
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                      />
                    </div>
                  </div>
                  {errors.address && (
                    <span className={FIELD_ERROR_CLASS}>{errors.address}</span>
                  )}
                </div>

                {/* Languages & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <SearchableLanguageSelect
                    value={formData.languages}
                    error={errors.languages}
                    onChange={(val) => {
                      if (errors.languages) {
                        setErrors((prev) => ({ ...prev, languages: undefined }));
                      }
                      setFormData((prev) => ({ ...prev, languages: val }));
                    }}
                    className="h-full"
                  />

                  <div className="relative h-full">
                    <div
                      className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.computerSkills
                        ? "border-red-500"
                        : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                        }`}
                    >
                      <label htmlFor="participate-skills" className="flex items-center cursor-pointer">
                        <img
                          src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791269549117-9bb93-magicpen.webp"
                          alt=""
                          className="size-4 shrink-0 mr-3 object-contain"
                        />
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                        >
                          Skills*
                        </Typography>
                      </label>
                      <div className="pl-7 w-full">
                        <textarea
                          id="participate-skills"
                          rows={1}
                          value={formData.computerSkills}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
                            if (errors.computerSkills && e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, computerSkills: undefined }));
                            }
                            setFormData({
                              ...formData,
                              computerSkills: e.target.value,
                            });
                            handleAutoResize(e);
                          }}
                          className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                        />
                      </div>
                    </div>
                    {errors.computerSkills && (
                      <span className={FIELD_ERROR_CLASS}>{errors.computerSkills}</span>
                    )}
                  </div>
                </div>
              </>
            ) : isVolunteer ? (
              /* Volunteer Row 3: Educational Qualification & Areas of Interest */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                <div className="relative h-full">
                  <div
                    className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.educationalQualification
                      ? "border-red-500"
                      : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <label htmlFor="participate-qualification" className="flex items-center cursor-pointer">
                      <img
                        src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791268884591-xwrs7-calendar-2.webp"
                        alt=""
                        className="size-4 shrink-0 mr-3 object-contain"
                      />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Educational Qualification*
                      </Typography>
                    </label>
                    <div className="pl-7 w-full">
                      <textarea
                        id="participate-qualification"
                        rows={1}
                        value={formData.educationalQualification}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          if (errors.educationalQualification && e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, educationalQualification: undefined }));
                          }
                          setFormData({
                            ...formData,
                            educationalQualification: e.target.value,
                          });
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                      />
                    </div>
                  </div>
                  {errors.educationalQualification && (
                    <span className={FIELD_ERROR_CLASS}>{errors.educationalQualification}</span>
                  )}
                </div>

                <VolunteerInterestSelect
                  value={formData.volunteerInterest}
                  error={errors.volunteerInterest}
                  onChange={(val) => {
                    if (errors.volunteerInterest) {
                      setErrors((prev) => ({ ...prev, volunteerInterest: undefined }));
                    }
                    setFormData((prev) => ({
                      ...prev,
                      volunteerInterest: val,
                    }));
                  }}
                  className="h-full"
                />
              </div>
            ) : (
              /* Specific to Fundraise (Frame 582: Gap 51px) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                <div className="relative h-full">
                  <div
                    className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.fundraisingGoal
                      ? "border-red-500"
                      : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <label htmlFor="participate-goal" className="flex items-center cursor-pointer">
                      <Calendar className="size-4 text-[#0D2838] shrink-0 mr-3" />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Fundraising Goal*
                      </Typography>
                    </label>
                    <div className="pl-7 w-full">
                      <textarea
                        id="participate-goal"
                        rows={1}
                        value={formData.fundraisingGoal}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          if (errors.fundraisingGoal && e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, fundraisingGoal: undefined }));
                          }
                          setFormData({
                            ...formData,
                            fundraisingGoal: e.target.value,
                          });
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                      />
                    </div>
                  </div>
                  {errors.fundraisingGoal && (
                    <span className={FIELD_ERROR_CLASS}>{errors.fundraisingGoal}</span>
                  )}
                </div>

                <div className="relative h-full">
                  <div
                    className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${errors.reason
                      ? "border-red-500"
                      : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <label htmlFor="participate-reason" className="flex items-center cursor-pointer">
                      <img
                        src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791269059713-dt428-book.webp"
                        alt=""
                        className="size-4 shrink-0 mr-3 object-contain"
                      />
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                      >
                        Why are you fundraising?*
                      </Typography>
                    </label>
                    <div className="pl-7 w-full">
                      <textarea
                        id="participate-reason"
                        rows={1}
                        value={formData.reason}
                        onInput={handleAutoResize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        onChange={(e) => {
                          if (errors.reason && e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, reason: undefined }));
                          }
                          setFormData({ ...formData, reason: e.target.value });
                          handleAutoResize(e);
                        }}
                        className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                      />
                    </div>
                  </div>
                  {errors.reason && (
                    <span className={FIELD_ERROR_CLASS}>{errors.reason}</span>
                  )}
                </div>
              </div>
            )}

            {/* Bottom section: Attach Resume for Intern, Why would you like to volunteer? for Volunteer, Your Message for Fundraise */}
            {isIntern ? (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="intern-resume"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fileError = !RESUME_TYPES.has(file.type)
                      ? "Resume must be a PDF, DOC, or DOCX file"
                      : file.size > MAX_RESUME_BYTES
                        ? "Resume must be 5 MB or smaller"
                        : undefined;
                    if (fileError) {
                      e.target.value = "";
                      setErrors((prev) => ({ ...prev, resumeFile: fileError }));
                      return;
                    }
                    setResumeFile(file);
                    if (errors.resumeFile) {
                      setErrors((prev) => ({ ...prev, resumeFile: undefined }));
                    }
                  }}
                />
                {resumeFile ? (
                  <div
                    onClick={handleViewResume}
                    className="w-full h-[6.19rem] flex items-center justify-between px-4 sm:px-5 border border-solid border-[#FCCC2D] rounded-[0.5rem] bg-[#FFFBF0] hover:bg-[#FFF6D6]/60 transition-colors cursor-pointer group"
                    title="Click to view resume"
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-3">
                      <FileText className="size-5 text-[#B87A00] shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <p className="font-manrope font-semibold text-[0.82rem] text-[#0D2838] group-hover:text-[#B87A00] group-hover:underline truncate transition-colors">
                          {resumeFile.name}
                        </p>
                        <p className="font-manrope text-[0.7rem] text-[#7C8B93]">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to submit
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
                      title="Remove resume"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="intern-resume"
                    className={`w-full h-[6.19rem] flex flex-col items-center justify-center gap-[0.625rem] border ${errors.resumeFile
                      ? "border-solid border-red-500 bg-red-50/20"
                      : "border-dashed border-[#A3A3A3] bg-white/65 hover:border-[#FCCC2D]"
                      } rounded-[0.5rem] cursor-pointer transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791269859574-9yagf-fi_4212312.webp"
                        alt=""
                        className="size-4 shrink-0 object-contain"
                      />
                      <span className="font-manrope font-medium text-[0.78rem] leading-[150%] tracking-[0.03em] text-[#0D2838]">
                        Attach Resume*
                      </span>
                    </div>
                    <span className="font-manrope font-medium text-[0.5rem] leading-[150%] tracking-[0.01em] text-[#7C8B93]">
                      Upload your resume(PDF,DOC) - Max 5 MB
                    </span>
                  </label>
                )}
                {errors.resumeFile && (
                  <span className={FIELD_ERROR_CLASS}>{errors.resumeFile}</span>
                )}
              </div>
            ) : isVolunteer ? (
              /* Why would you like to volunteer?* for Volunteer */
              <div className="relative">
                <div
                  className={`min-h-[5.54rem] h-auto pb-1.5 flex flex-col justify-between border-b transition-all ${errors.whyVolunteer
                    ? "border-red-500"
                    : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                >
                  <label htmlFor="participate-whyVolunteer" className="flex items-center cursor-pointer pt-0.5">
                    <MessageSquare className="size-4 text-[#0D2838] shrink-0 mr-3" />
                    <Typography
                      variant="caption-1"
                      as="span"
                      className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                    >
                      Why would you like to volunteer?*
                    </Typography>
                  </label>
                  <div className="pl-7 w-full">
                    <textarea
                      id="participate-whyVolunteer"
                      rows={1}
                      maxLength={500}
                      value={formData.whyVolunteer || formData.message}
                      onInput={handleAutoResize}
                      onChange={(e) => {
                        if (errors.whyVolunteer && e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, whyVolunteer: undefined }));
                        }
                        setFormData({
                          ...formData,
                          whyVolunteer: e.target.value,
                          message: e.target.value,
                        });
                        handleAutoResize(e);
                      }}
                      className="w-full min-h-[2.5rem] max-h-[8rem] bg-transparent text-[0.82rem] font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-y-auto block leading-normal py-1"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  {errors.whyVolunteer ? (
                    <span className="text-xs text-red-600 font-manrope block">
                      {errors.whyVolunteer}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[0.7rem] text-[#7C8B93] font-manrope select-none">
                    {(formData.whyVolunteer || formData.message).length} / 500
                  </span>
                </div>
              </div>
            ) : (
              /* Your Message for Fundraise */
              <div className="relative">
                <div
                  className={`min-h-[5.54rem] h-auto pb-1.5 flex flex-col justify-between border-b transition-all ${errors.message
                    ? "border-red-500"
                    : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                >
                  <label htmlFor="participate-message" className="flex items-center cursor-pointer pt-0.5">
                    <MessageSquare className="size-4 text-[#0D2838] shrink-0 mr-3" />
                    <Typography
                      variant="caption-1"
                      as="span"
                      className="font-medium text-[#0D2838] select-none font-manrope leading-normal"
                    >
                      Your Message*
                    </Typography>
                  </label>
                  <div className="pl-7 w-full">
                    <textarea
                      id="participate-message"
                      rows={1}
                      maxLength={500}
                      value={formData.message}
                      onInput={handleAutoResize}
                      onChange={(e) => {
                        if (errors.message && e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, message: undefined }));
                        }
                        setFormData({ ...formData, message: e.target.value });
                        handleAutoResize(e);
                      }}
                      className="w-full min-h-[2.5rem] max-h-[8rem] bg-transparent text-[0.82rem] font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-y-auto block leading-normal py-1"
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
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="relative flex flex-col gap-1 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="participate-terms"
                  checked={formData.agreeTerms}
                  onChange={(e) => {
                    if (errors.agreeTerms && e.target.checked) {
                      setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                    }
                    setFormData({ ...formData, agreeTerms: e.target.checked });
                  }}
                  className="size-4 accent-[#FCCC2D] rounded-sm cursor-pointer"
                />
                <label
                  htmlFor="participate-terms"
                  className="cursor-pointer"
                >
                  <Typography variant="caption-1" as="span" className="font-manrope font-normal text-[#596D79]">
                    I have read and agree to the{" "}
                  </Typography>
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition-opacity"
                  >
                    <Typography variant="caption-1" as="span" className="font-manrope font-medium text-[#E5A810]">
                      Terms & Conditions
                    </Typography>
                  </a>
                </label>
              </div>
              {errors.agreeTerms && (
                <span className={FIELD_ERROR_CLASS}>{errors.agreeTerms}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted || submitting}
              aria-busy={submitting}
              className="w-full mt-4 py-3.5 px-6 bg-[#FCCC2D] text-[#2E1C12] rounded-md transition duration-200 hover:bg-[#F5C21B] active:scale-[0.99] cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2E1C12]">
                {submitted
                  ? "Submitted ✓"
                  : submitting
                    ? "Submitting…"
                    : "Submit Application"}
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
                  {successMessage || "Application Submitted Successfully!"}
                </Typography>
                <Typography
                  variant="caption-2"
                  as="p"
                  className="font-manrope font-normal text-[#2E7D32]"
                >
                  Thank you for reaching out to HCG Foundation. Our team will review your application and get in touch with you soon.
                </Typography>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
