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
} from "lucide-react";
import Typography from "@/lib/Typography";
import PhoneInputField from "@/shared/forms/PhoneInputField";

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
    fundraisingGoal: "",
    reason: "",
    volunteerInterest: "",
    availability: "",
    message: "",
    agreeTerms: false,
  });

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
        fundraisingGoal: "",
        reason: "",
        volunteerInterest: "",
        availability: "",
        message: "",
        agreeTerms: false,
      });
      onClose();
    }, 2000);
  };

  const isIntern = type === "intern";
  const isFundraise = type === "fundraise";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Container with exact Figma styling & fluid responsive height for all screens */}
      <div
        className={`relative z-10 w-full max-w-[640px] bg-white shadow-2xl overflow-hidden my-auto flex flex-col ${
          isIntern
            ? "max-h-[92vh] lg:h-auto lg:max-h-[860px] rounded-[6px]"
            : "max-h-[90vh] lg:h-auto lg:max-h-[736px] rounded-[4px]"
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
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 p-2 text-[#6C6048] hover:text-[#2E1C12] transition-colors rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5 sm:size-6" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 overflow-y-auto max-h-[85vh] sm:max-h-[88vh] flex flex-col justify-between">
          {/* Header Title & Subtitle matching Figma 100% */}
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <Typography variant="heading-2" as="h2" className="font-serif text-[1.5rem] sm:text-[1.875rem] lg:text-[2rem] text-[#2E1C12] italic font-normal tracking-tight mb-1">
              {isIntern && "Apply for Internship at"}
              {isFundraise && "Start a Fundraising Campaign at"}
              {!isIntern && !isFundraise && "Become a Volunteer at"}
            </Typography>
            <div className="text-[1.5rem] sm:text-[1.875rem] lg:text-[2rem] font-sans font-bold tracking-tight mb-3">
              <span className="text-[#0083B0]">HCG </span>
              <span className="text-[#DF6A4B]">Foundation</span>
            </div>
            <Typography variant="body-8" as="p" className="font-manrope text-[0.75rem] sm:text-[0.875rem] text-[#6C6048] leading-relaxed">
              {isIntern &&
                "Passionate about making a difference? Join the HCG Foundation Internship Program to gain hands-on experience, learn from experts, and build skills for your future career."}
              {isFundraise &&
                "Turn your network into meaningful support for cancer patients and families. Fill in the details below to start your fundraising journey with us."}
              {!isIntern &&
                !isFundraise &&
                "Join our team of dedicated volunteers and help support patient care initiatives, screening camps, administrative work, and community outreach."}
            </Typography>
          </div>

          {submitted ? (
            <div className="my-8 p-6 bg-[#FFF9EA] border border-[#F3E3B6] rounded-[8px] text-center">
              <Typography variant="heading-3" as="h3" className="font-serif text-xl text-[#2E1C12] font-semibold mb-2">
                Application Submitted!
              </Typography>
              <Typography variant="body-8" as="p" className="font-manrope text-sm text-[#6C6048]">
                Thank you for reaching out to HCG Foundation. Our team will review your application and get in touch with you soon.
              </Typography>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6 font-manrope">
              {/* Row 1: Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="relative">
                  <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                    <User className="size-4 text-[#A09578] shrink-0 mr-3" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name*"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                    />
                  </div>
                </div>

                <PhoneInputField
                  label="Phone Number"
                  required
                  value={formData.phone}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, phone: val || "" }))
                  }
                />
              </div>

              {/* Row 2: Email & Gender (Intern) / Location (Fundraise/Volunteer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="relative">
                  <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                    <Mail className="size-4 text-[#A09578] shrink-0 mr-3" />
                    <input
                      type="email"
                      required
                      placeholder="Email Address*"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                    />
                  </div>
                </div>

                {isIntern ? (
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <User className="size-4 text-[#A09578] shrink-0 mr-3" />
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden font-manrope cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          Select your gender*
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="size-4 text-[#A09578] shrink-0 ml-1 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <User className="size-4 text-[#A09578] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder="City / Location*"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                      />
                      <ChevronDown className="size-4 text-[#A09578] shrink-0 ml-1 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3 (Specific to Intern vs Fundraise/Volunteer) */}
              {isIntern ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <Calendar className="size-4 text-[#A09578] shrink-0 mr-3" />
                        <input
                          type="text"
                          placeholder="DOB (DD/MM/YYYY)"
                          value={formData.dob}
                          onChange={(e) =>
                            setFormData({ ...formData, dob: e.target.value })
                          }
                          className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <BookOpen className="size-4 text-[#A09578] shrink-0 mr-3" />
                        <input
                          type="text"
                          required
                          placeholder="Current Course*"
                          value={formData.course}
                          onChange={(e) =>
                            setFormData({ ...formData, course: e.target.value })
                          }
                          className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <MapPin className="size-4 text-[#A09578] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder="Your Address*"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                      />
                    </div>
                  </div>

                  {/* Languages & Computer Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <Globe className="size-4 text-[#A09578] shrink-0 mr-3" />
                        <select
                          required
                          value={formData.languages}
                          onChange={(e) =>
                            setFormData({ ...formData, languages: e.target.value })
                          }
                          className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden font-manrope cursor-pointer appearance-none"
                        >
                          <option value="" disabled>
                            Languages Known*
                          </option>
                          <option value="English, Hindi">English, Hindi</option>
                          <option value="English, Kannada">English, Kannada</option>
                          <option value="English, Hindi, Kannada">
                            English, Hindi, Kannada
                          </option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="size-4 text-[#A09578] shrink-0 ml-1 pointer-events-none" />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                        <Laptop className="size-4 text-[#A09578] shrink-0 mr-3" />
                        <input
                          type="text"
                          required
                          placeholder="Computer Skills*"
                          value={formData.computerSkills}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              computerSkills: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Specific to Fundraise / Volunteer */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <Calendar className="size-4 text-[#A09578] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder={
                          isFundraise
                            ? "Fundraising Goal*"
                            : "Area of Interest*"
                        }
                        value={
                          isFundraise
                            ? formData.fundraisingGoal
                            : formData.volunteerInterest
                        }
                        onChange={(e) =>
                          isFundraise
                            ? setFormData({
                                ...formData,
                                fundraisingGoal: e.target.value,
                              })
                            : setFormData({
                                ...formData,
                                volunteerInterest: e.target.value,
                              })
                        }
                        className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                      <BookOpen className="size-4 text-[#A09578] shrink-0 mr-3" />
                      <input
                        type="text"
                        required
                        placeholder={
                          isFundraise
                            ? "Why are you fundraising?*"
                            : "Availability / Hours per week*"
                        }
                        value={
                          isFundraise ? formData.reason : formData.availability
                        }
                        onChange={(e) =>
                          isFundraise
                            ? setFormData({
                                ...formData,
                                reason: e.target.value,
                              })
                            : setFormData({
                                ...formData,
                                availability: e.target.value,
                              })
                        }
                        className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Your Message */}
              <div className="relative">
                <div className="flex items-start border-b border-[#E5E0D0] py-2.5 focus-within:border-[#FCCC2D] transition-colors">
                  <MessageSquare className="size-4 text-[#A09578] shrink-0 mr-3 mt-1" />
                  <textarea
                    rows={2}
                    placeholder="Your Message*"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2E1C12] focus:outline-hidden placeholder:text-[#A09578] font-manrope resize-none"
                  />
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-2 pt-2">
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
                  className="text-[0.75rem] text-[#6C6048] cursor-pointer"
                >
                  I have read and agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D99A00] underline font-medium hover:text-[#B58000]"
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-6 bg-[#FCCC2D] text-[#382E07] font-semibold text-[0.875rem] sm:text-[1rem] rounded-[8px] shadow-xs transition duration-300 hover:bg-[#E9B510] hover:shadow-md cursor-pointer"
              >
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
