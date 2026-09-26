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
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Fresh clean state every time modal is opened
      setSubmitted(false);
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

  if (!isOpen || !type) return null;

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
      onClose();
    }, 2000);
  };

  const isIntern = type === "intern";
  const isFundraise = type === "fundraise";
  const isVolunteer = type === "volunteer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Container with exact Figma styling: width 640px (40rem), height 860px (53.75rem) for Intern (Frame 556), 736px (46rem) for Fundraise/Volunteer */}
      <div
        className={`relative z-10 w-full max-w-[40rem] bg-white shadow-2xl overflow-hidden my-auto flex flex-col ${isIntern
          ? "max-h-[96vh] sm:h-[53.75rem] rounded-[0.625rem]"
          : "max-h-[95vh] sm:h-[46rem] rounded-[0.625rem]"
          }`}
      >
        {/* Full Modal Watermark Background Image matching Figma */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none"
          style={{
            backgroundImage: `url('/Get Involved/Participate/form background image.png')`,
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
        <div className="relative z-10 p-6 sm:px-12 sm:py-9 overflow-y-auto h-full flex flex-col justify-between">
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

          {submitted ? (
            <div className="my-8 p-6 bg-[#FFF9EA] border border-[#F3E3B6] rounded-lg text-center">
              <div className="mb-2">
                <Typography variant="heading-3" as="h3" className="font-manrope font-medium text-[#2E1C12]">
                  Application Submitted!
                </Typography>
              </div>
              <Typography variant="body-8" as="p" className="font-manrope font-normal text-[#6C6048]">
                Thank you for reaching out to HCG Foundation. Our team will review your application and get in touch with you soon.
              </Typography>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-[34rem] mx-auto flex-1 flex flex-col justify-between font-manrope space-y-4 sm:space-y-5">
              {/* Row 1: Full Name & Phone Number (Figma Frame 560: 544.45px x 41.14px, Gap: 51px) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                <div className="relative">
                  <div
                    className={`min-h-[2.85rem] h-auto pb-1 flex flex-col justify-between border-b transition-all ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                  >
                    <label htmlFor="participate-fullName" className="flex items-center cursor-pointer">
                      <User className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                        required
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
                    <div className="mt-1">
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="font-manrope text-red-500"
                      >
                        {errors.fullName}
                      </Typography>
                    </div>
                  )}
                </div>

                <PhoneInputField
                  label="Phone Number"
                  hideLabel
                  required
                  value={formData.phone}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, phone: val || "" }))
                  }
                />
              </div>

              {/* Row 2: Email & Gender (Intern) / Location (Fundraise/Volunteer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                <div className="relative h-full">
                  <div
                    className={`min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b transition-all ${
                      errors.email
                        ? "border-red-500"
                        : "border-[#A3A3A399] focus-within:border-[#FCCC2D]"
                    }`}
                  >
                    <label htmlFor="participate-email" className="flex items-center cursor-pointer">
                      <Mail className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                        required
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
                    <div className="mt-1">
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="font-manrope text-red-500"
                      >
                        {errors.email}
                      </Typography>
                    </div>
                  )}
                </div>

                {isIntern ? (
                  <GenderSelect
                    value={formData.gender}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, gender: val }))
                    }
                    className="h-full"
                    required
                  />
                ) : (
                  <LocationSelect
                    value={formData.location}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, location: val }))
                    }
                    className="h-full"
                    required
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
                        className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
                      >
                        <label htmlFor="participate-course" className="flex items-center cursor-pointer">
                          <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                            required
                            value={formData.course}
                            onInput={handleAutoResize}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                            onChange={(e) => {
                              setFormData({ ...formData, course: e.target.value });
                              handleAutoResize(e);
                            }}
                            className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <div
                      className="min-h-[2.85rem] h-auto pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
                    >
                      <label htmlFor="participate-address" className="flex items-center cursor-pointer">
                        <MapPin className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                          required
                          value={formData.address}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
                            setFormData({ ...formData, address: e.target.value });
                            handleAutoResize(e);
                          }}
                          className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Languages & Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                    <SearchableLanguageSelect
                      value={formData.languages}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, languages: val }))
                      }
                      className="h-full"
                      required
                    />

                    <div className="relative h-full">
                      <div
                        className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
                      >
                        <label htmlFor="participate-skills" className="flex items-center cursor-pointer">
                          <Wrench className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                            required
                            value={formData.computerSkills}
                            onInput={handleAutoResize}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                            onChange={(e) => {
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
                    </div>
                  </div>
                </>
              ) : isVolunteer ? (
                /* Volunteer Row 3: Educational Qualification & Areas of Interest */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <div className="relative h-full">
                    <div
                      className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
                    >
                      <label htmlFor="participate-qualification" className="flex items-center cursor-pointer">
                        <Calendar className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                          required
                          value={formData.educationalQualification}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
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
                  </div>

                  <VolunteerInterestSelect
                    value={formData.volunteerInterest}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        volunteerInterest: val,
                      }))
                    }
                    className="h-full"
                    required
                  />
                </div>
              ) : (
                /* Specific to Fundraise (Frame 582: Gap 51px) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <div className="relative h-full">
                    <div
                      className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
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
                          required
                          value={formData.fundraisingGoal}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
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
                  </div>

                  <div className="relative h-full">
                    <div
                      className="min-h-[2.85rem] h-full pb-1 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
                    >
                      <label htmlFor="participate-reason" className="flex items-center cursor-pointer">
                        <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-3" />
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
                          required
                          value={formData.reason}
                          onInput={handleAutoResize}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          onChange={(e) => {
                            setFormData({ ...formData, reason: e.target.value });
                            handleAutoResize(e);
                          }}
                          className="w-full bg-transparent text-[0.82rem] leading-normal font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-hidden block min-h-[1.2rem] py-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom section: Attach Resume for Intern (Figma Frame 622: 545px x 99px, Radius 8px, Dashed #A3A3A3, Fill #FFFFFF 65%), Why would you like to volunteer? for Volunteer, Your Message for Fundraise */}
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
                      if (file) setResumeFile(file);
                    }}
                  />
                  {resumeFile ? (
                    <div className="w-full h-[6.19rem] flex items-center justify-between px-4 sm:px-5 border border-solid border-[#FCCC2D] rounded-[0.5rem] bg-[#FFFBF0] transition-colors">
                      <div className="flex items-center gap-3 min-w-0 mr-3">
                        <FileText className="size-5 text-[#B87A00] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-manrope font-semibold text-[0.82rem] text-[#0D2838] truncate">
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
                      className="w-full h-[6.19rem] flex flex-col items-center justify-center gap-[0.625rem] border border-dashed border-[#A3A3A3] rounded-[0.5rem] bg-white/65 cursor-pointer hover:border-[#FCCC2D] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-[#7C8B93]" />
                        <span className="font-manrope font-medium text-[0.78rem] leading-[150%] tracking-[0.03em] text-[#0D2838]">
                          Attach Resume*
                        </span>
                      </div>
                      <span className="font-manrope font-medium text-[0.5rem] leading-[150%] tracking-[0.01em] text-[#7C8B93]">
                        Upload your resume(PDF,DOC) - Max 5 MB
                      </span>
                    </label>
                  )}
                </div>
              ) : isVolunteer ? (
                /* Why would you like to volunteer?* for Volunteer - Figma 5.54rem initial space, hugs text when typed */
                <div className="relative">
                  <div
                    className="min-h-[5.54rem] h-auto pb-1.5 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
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
                        required
                        maxLength={500}
                        value={formData.whyVolunteer || formData.message}
                        onInput={handleAutoResize}
                        onChange={(e) => {
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
                  <div className="flex justify-end mt-1">
                    <span className="text-[0.7rem] text-[#7C8B93] font-manrope select-none">
                      {(formData.whyVolunteer || formData.message).length} / 500
                    </span>
                  </div>
                </div>
              ) : (
                /* Your Message for Fundraise - Figma 5.54rem initial space, hugs text when typed */
                <div className="relative">
                  <div
                    className="min-h-[5.54rem] h-auto pb-1.5 flex flex-col justify-between border-b border-[#A3A3A399] focus-within:border-[#FCCC2D] transition-all"
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
                        required
                        maxLength={500}
                        value={formData.message}
                        onInput={handleAutoResize}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          handleAutoResize(e);
                        }}
                        className="w-full min-h-[2.5rem] max-h-[8rem] bg-transparent text-[0.82rem] font-medium text-[#0D2838] focus:outline-hidden font-manrope resize-none overflow-y-auto block leading-normal py-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[0.7rem] text-[#7C8B93] font-manrope select-none">
                      {formData.message.length} / 500
                    </span>
                  </div>
                </div>
              )}

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="participate-terms"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeTerms: e.target.checked })
                  }
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-6 bg-[#FCCC2D] text-[#2E1C12] rounded-md transition duration-200 hover:bg-[#F5C21B] active:scale-[0.99] cursor-pointer"
              >
                <Typography variant="button-1" as="span" className="font-manrope font-semibold text-[#2E1C12]">
                  Submit Application
                </Typography>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
