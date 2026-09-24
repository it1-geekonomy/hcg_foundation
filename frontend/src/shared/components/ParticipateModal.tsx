"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import PhoneInputField from "@/shared/forms/PhoneInputField";
import SearchableLanguageSelect from "@/shared/forms/SearchableLanguageSelect";
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

  // Lock body scroll when modal is open
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
        className={`relative z-10 w-full max-w-[40rem] bg-white shadow-2xl overflow-hidden my-auto flex flex-col ${
          isIntern
            ? "max-h-[96vh] sm:h-[53.75rem] rounded-md"
            : "max-h-[95vh] sm:h-[46rem] rounded-md"
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
        <div className="relative z-10 p-6 sm:p-9 md:p-10 overflow-y-auto h-full flex flex-col justify-between">
          {/* Header Title & Subtitle matching Figma 100% */}
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <div className="mb-1">
              <Typography
                variant="heading-5"
                as="h2"
                className="font-tiempos-headline font-normal italic text-[#0D2838]"
              >
                {isIntern && "Apply for Internship at"}
                {isFundraise && "Start a Fundraising Campaign at"}
                {!isIntern && !isFundraise && "Become a Volunteer at"}
              </Typography>
            </div>
            <div className="mb-3">
              <Typography
                variant="heading-8"
                as="div"
                className="font-manrope font-bold bg-gradient-to-r from-[#208CCC] via-[#FABE3B] to-[#9D0037] bg-clip-text text-transparent inline-block"
              >
                HCG Foundation
              </Typography>
            </div>
            <div className="max-w-[34rem] mx-auto">
              <Typography
                variant="caption-1"
                as="p"
                className="font-manrope font-normal text-[#596D79] text-center leading-relaxed"
              >
                {isIntern && (
                  <>
                    <span className="block">
                      Passionate about making a difference? Join the HCG Foundation Internship Program to
                    </span>
                    <span className="block">
                      gain hands-on experience, learn from experts, and build skills for your future career.
                    </span>
                  </>
                )}
                {isFundraise && (
                  <>
                    <span className="block">
                      Turn your network into meaningful support for cancer patients and families.
                    </span>
                    <span className="block">
                      Fill in the details below to start your fundraising journey with us.
                    </span>
                  </>
                )}
                {isVolunteer && (
                  <span className="block text-[#596D79]">
                    &ldquo;Share your time, skills, and energy to support cancer patients, families, and communities.&rdquo;
                  </span>
                )}
              </Typography>
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
                    className={`h-[2.57rem] flex items-start pt-0.5 border-b transition-colors ${errors.fullName
                        ? "border-red-500"
                        : "border-[#E5E0D0] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <User className="size-4 text-[#0D2838] shrink-0 mr-3 mt-0.5" />
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
                <div className="relative">
                  <div
                    className={`flex items-start pt-1 pb-7 border-b transition-colors ${errors.email
                        ? "border-red-500"
                        : "border-[#E5E0D0] focus-within:border-[#FCCC2D]"
                      }`}
                  >
                    <Mail className="size-4 text-[#0D2838] shrink-0 mr-3 mt-0.5" />
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

                {isIntern ? (
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <User className="size-4 text-[#0D2838] shrink-0 mr-3" />
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full bg-transparent pl-[0.75rem] text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden font-manrope cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          Select your gender*
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="size-4 text-[#0D2838] shrink-0 ml-1 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-start pt-1 pb-7 border-b border-[#E5E0D0] focus-within:border-[#FCCC2D] transition-colors">
                      <User className="size-4 text-[#0D2838] shrink-0 mr-3 mt-0.5" />
                      <select
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden font-manrope cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          City / Location*
                        </option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Pune">Pune</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="size-4 text-[#0D2838] shrink-0 ml-1 mt-0.5 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3 (Specific to Intern vs Fundraise/Volunteer) */}
              {isIntern ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <Calendar className="size-4 text-[#0D2838] shrink-0 mr-3" />
                        <input
                          type="text"
                          placeholder="DOB (DD/MM/YYYY)"
                          value={formData.dob}
                          onChange={(e) =>
                            setFormData({ ...formData, dob: e.target.value })
                          }
                          className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-3" />
                        <input
                          type="text"
                          required
                          placeholder="Current Course*"
                          value={formData.course}
                          onChange={(e) =>
                            setFormData({ ...formData, course: e.target.value })
                          }
                          className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <MapPin className="size-4 text-[#0D2838] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder="Your Address*"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                      />
                    </div>
                  </div>

                  {/* Languages & Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                    <SearchableLanguageSelect
                      value={formData.languages}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, languages: val }))
                      }
                      required
                    />

                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <Wrench className="size-4 text-[#0D2838] shrink-0 mr-3" />
                        <input
                          type="text"
                          required
                          placeholder="Skills*"
                          value={formData.computerSkills}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              computerSkills: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : isVolunteer ? (
                /* Volunteer Row 3: Educational Qualification & Areas of Interest */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <div className="relative">
                    <div className="flex items-start pt-1 pb-7 border-b border-[#E5E0D0] focus-within:border-[#FCCC2D] transition-colors">
                      <Calendar className="size-4 text-[#0D2838] shrink-0 mr-3 mt-0.5" />
                      <input
                        type="text"
                        required
                        placeholder="Educational Qualification*"
                        value={formData.educationalQualification}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            educationalQualification: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-start pt-1 pb-7 border-b border-[#E5E0D0] focus-within:border-[#FCCC2D] transition-colors">
                      <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-3 mt-0.5" />
                      <select
                        required
                        value={formData.volunteerInterest}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            volunteerInterest: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden font-manrope cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          Areas of Interest*
                        </option>
                        <option value="Patient Support & Care">Patient Support & Care</option>
                        <option value="Screening & Medical Camps">Screening & Medical Camps</option>
                        <option value="Community Outreach & Awareness">Community Outreach & Awareness</option>
                        <option value="Art Therapy & Creative Sessions">Art Therapy & Creative Sessions</option>
                        <option value="Administrative & Operations">Administrative & Operations</option>
                        <option value="Fundraising & Event Support">Fundraising & Event Support</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="size-4 text-[#0D2838] shrink-0 ml-1 mt-0.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Specific to Fundraise (Frame 582: Gap 51px) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-[3.19rem]">
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <Calendar className="size-4 text-[#0D2838] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder="Fundraising Goal*"
                        value={formData.fundraisingGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fundraisingGoal: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <BookOpen className="size-4 text-[#0D2838] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder="Why are you fundraising?*"
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reason: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom section: Attach Resume for Intern (Figma Frame 622: 545px x 99px, Radius 8px, Dashed #A3A3A3, Fill #FFFFFF 65%), Why would you like to volunteer? for Volunteer, Your Message for Fundraise */}
              {isIntern ? (
                <div className="relative">
                  <input
                    type="file"
                    id="intern-resume"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setResumeFile(file);
                    }}
                  />
                  <label
                    htmlFor="intern-resume"
                    className="w-full h-[6.19rem] flex flex-col items-center justify-center gap-[0.625rem] border border-dashed border-[#A3A3A3] rounded-[0.5rem] bg-white/65 cursor-pointer hover:border-[#FCCC2D] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-[#7C8B93]" />
                      <span className="font-manrope font-medium text-[0.78rem] leading-[150%] tracking-[0.03em] text-[#0D2838]">
                        {resumeFile ? resumeFile.name : "Attach Resume*"}
                      </span>
                    </div>
                    <span className="font-manrope font-medium text-[0.5rem] leading-[150%] tracking-[0.01em] text-[#7C8B93]">
                      {resumeFile
                        ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                        : "Upload your resume(PDF,DOC) - Max 5 MB"}
                    </span>
                  </label>
                </div>
              ) : isVolunteer ? (
                /* Why would you like to volunteer?* for Volunteer */
                <div className="relative">
                  <div className="flex items-start border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                    <MessageSquare className="size-4 text-[#0D2838] shrink-0 mr-3 mt-1" />
                    <textarea
                      required
                      placeholder="Why would you like to volunteer?*"
                      value={formData.whyVolunteer || formData.message}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whyVolunteer: e.target.value,
                          message: e.target.value,
                        })
                      }
                      className="w-full h-[5.54rem] bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* Your Message (Height: 88.67px matching Figma Frame 298) */
                <div className="relative">
                  <div className="flex items-start border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                    <MessageSquare className="size-4 text-[#0D2838] shrink-0 mr-3 mt-1" />
                    <textarea
                      placeholder="Your Message*"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full h-[5.54rem] bg-transparent text-[0.78rem] leading-[150%] tracking-[0.03em] font-medium text-[#0D2838] focus:outline-hidden placeholder:text-[#0D2838] font-manrope resize-none"
                    />
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
