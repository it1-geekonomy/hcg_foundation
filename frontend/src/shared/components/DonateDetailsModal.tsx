"use client";

import { FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lock, X } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  donateIcon,
  donateTheme,
  donorAvatars,
} from "@/domains/home/constants/donate";
import {
  getDonationCountry,
  isIndiaCountry,
} from "@/domains/home/constants/countries";
import {
  type DonationCurrencyCode,
  formatDonationAmount,
  getDonationCurrency,
} from "@/domains/home/constants/donation-currency";
import CountryFlag from "@/shared/components/CountryFlag";
import { type DonationCategory, donorsApi } from "@/shared/lib/donors-api";
import { nationalPhoneDigits } from "@/shared/lib/phone";
import CountrySelect from "@/shared/components/CountrySelect";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: { error?: { description?: string } }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

// 16px on phones stops iOS Safari from zooming into the focused field.
const underlineInput =
  "block w-full min-w-0 bg-transparent py-2 font-manrope text-base leading-6 text-white outline-none placeholder:text-white/55 sm:text-sm";

const underlineField =
  "min-w-0 border-b border-white/35 transition-colors focus-within:border-[#FCCC2D]";

const MAX_AMOUNT_DIGITS = 10;

/**
 * Safari/macOS colour fixes:
 * - Overlay uses an explicit rgba() instead of Tailwind's `bg-[#1c1c1c]/70`,
 *   which compiles to color-mix() and renders inconsistently in some Safari versions.
 * - Both overlay and panel set -webkit-backdrop-filter alongside backdrop-filter.
 * - The panel gets its own compositing layer (translateZ / isolation) so Safari
 *   doesn't mis-paint the blur inside a scrolling position:fixed container.
 */
const overlayStyle = {
  backgroundColor: "rgba(28, 28, 28, 0.7)",
  WebkitBackdropFilter: "blur(2px)",
  backdropFilter: "blur(2px)",
} as const;

const panelStyle = {
  backgroundColor: donateTheme.glassBg,
  WebkitBackdropFilter: "blur(12px)",
  backdropFilter: "blur(12px)",
  transform: "translateZ(0)",
  isolation: "isolate",
} as const;

type Props = {
  amount: number;
  currency: DonationCurrencyCode;
  countryCode: string;
  /** Where the donor wants the money to go; omitted → General Funds. */
  donationCategory?: DonationCategory;
  onClose: () => void;
  onAmountChange?: (amount: number) => void;
};

function FieldLabel({
  htmlFor,
  className = "",
  children,
}: {
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-manrope text-[13px] font-medium leading-snug text-white/85 sm:text-sm ${className}`}
    >
      {children}
    </label>
  );
}

export default function DonateDetailsModal({
  amount,
  currency,
  countryCode,
  donationCategory,
  onClose,
  onAmountChange,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [pan, setPan] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  const [amountValue, setAmountValue] = useState(amount);
  const [amountDraft, setAmountDraft] = useState(String(amount));
  const [editingAmount, setEditingAmount] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const currencyMeta = getDonationCurrency(currency);
  const formattedAmount = formatDonationAmount(amountValue, currency);
  // The donation country (picked on the form) decides currency, PAN and 80G;
  // the phone's country only sets the dialling code.
  const country = getDonationCountry(countryCode);
  const international = !isIndiaCountry(countryCode);
  const [phoneCountryCode, setPhoneCountryCode] = useState(countryCode);
  const phoneCountry = getDonationCountry(phoneCountryCode);
  const indianPhone = isIndiaCountry(phoneCountryCode);

  function startAmountEdit() {
    setEditingAmount(true);
    setAmountDraft(String(amountValue));
    setError(null);
  }

  function commitAmount() {
    const next = Number(amountDraft.replace(/[^\d.]/g, ""));
    if (!next || next < 1) {
      setError("Please enter a valid amount.");
      setAmountDraft(String(amountValue));
      setEditingAmount(false);
      return false;
    }
    setAmountValue(next);
    setAmountDraft(String(next));
    setEditingAmount(false);
    onAmountChange?.(next);
    return true;
  }

  useEffect(() => {
    if (editingAmount) amountInputRef.current?.focus();
  }, [editingAmount]);

  // Grow the message box with its text (CSS max-height caps it at 3 lines).
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { body } = document;
    const original = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      Object.assign(body.style, original);
      window.scrollTo(0, scrollY);
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (editingAmount && !commitAmount()) {
      return;
    }

    if (amountValue < 1) {
      setError("Please choose a valid amount.");
      return;
    }

    const national = nationalPhoneDigits(phone, phoneCountry.dial);
    if (indianPhone) {
      if (national.length !== 10) {
        setError("Please enter a 10-digit phone number.");
        return;
      }
    } else if (national.length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }

    const payloadPhone =
      indianPhone || phoneCountry.dial === "+"
        ? national
        : `${phoneCountry.dial}${national}`;

    setLoading(true);
    try {
      const res = await donorsApi.createOrder({
        fullName: fullName.trim(),
        phone: payloadPhone,
        email: email.trim(),
        city: city.trim() || undefined,
        country: country.name,
        countryCode,
        isInternational: international,
        currency,
        pan: international ? undefined : pan.replace(/\s/g, "") || undefined,
        message: message.trim() || undefined,
        donationCategory,
        amount: amountValue,
      });

      const checkout = res.data;
      if (!window.Razorpay) {
        throw new Error("Payment widget is still loading. Please try again.");
      }

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        name: "HCG Foundation",
        description: "Donation",
        order_id: checkout.orderId,
        prefill: {
          name: checkout.name,
          email: checkout.email,
          contact: checkout.phone,
        },
        theme: { color: "#FCCC2D" },
        handler: async (response: RazorpaySuccess) => {
          try {
            const verified = await donorsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setReceipt(verified.data.receiptNumber || "Payment received");
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment succeeded but confirmation failed. Please contact us with your payment id.",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-details-title"
      onClick={onClose}
    >
      {/* min-h-full centres the panel when it fits and lets the overlay scroll when it doesn't */}
      <div className="flex min-h-full items-center justify-center px-3 py-4 sm:p-6">
        <div
          className="relative w-full max-w-[560px] rounded-md border border-white/15 px-5 py-6 shadow-2xl sm:px-10 sm:py-8"
          style={panelStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close donation form"
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-[#FCCC2D] sm:right-3 sm:top-3"
          >
            <X className="h-5 w-5" />
          </button>

          {receipt ? (
            <div className="flex flex-col items-center py-4 text-center">
              <Image
                src={donateIcon}
                alt=""
                width={36}
                height={36}
                className="mb-3 h-9 w-9"
              />
              <Typography
                variant="heading-6"
                as="h3"
                className="font-tiempos-fine font-normal text-white"
              >
                Thank you
              </Typography>
              <Typography
                variant="body-7"
                as="p"
                className="mt-3 wrap-break-word px-2 font-argestadisplay font-light leading-snug text-white/70 sm:px-4"
              >
                Your donation of {formattedAmount} {currency} was received.
              </Typography>
              <Typography
                variant="body-8"
                as="p"
                className="mt-2 font-manrope text-white/60"
              >
                Receipt: {receipt}
              </Typography>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 w-full rounded bg-[#FCCC2D] py-3 font-manrope font-bold text-[#3A2E00]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col items-center gap-1.5 px-8 text-center">
                <div className="flex items-center gap-2">
                  <Image
                    src={donateIcon}
                    alt=""
                    width={26}
                    height={26}
                    className="h-6 w-6 sm:h-7 sm:w-7"
                  />
                  <h3
                    id="donate-details-title"
                    className="font-tiempos-fine font-normal text-white"
                  >
                    <Typography variant="heading-6" as="span">
                      Donate Now
                    </Typography>
                  </h3>
                </div>
                <Typography
                  variant="body-7"
                  as="p"
                  className="hidden max-w-[360px] font-argestadisplay font-light leading-snug text-white/70 [@media(min-width:640px)_and_(min-height:761px)]:block"
                >
                  Your support provides cancer care, emotional support, and
                  financial aid to those in need.
                </Typography>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel
                  htmlFor="donate-amount"
                  className="sr-only sm:not-sr-only"
                >
                  Chosen Amount
                </FieldLabel>
                <div className="flex items-stretch gap-2 sm:gap-3">
                  <div className="flex min-h-[44px] min-w-0 flex-1 items-center rounded border border-[#FCCC2D] bg-[#8A7A28] px-4">
                    {editingAmount ? (
                      <div className="flex w-full min-w-0 items-center gap-1">
                        <span className="shrink-0 font-manrope text-base font-medium text-white sm:text-sm">
                          {currencyMeta.symbol}
                        </span>
                        <input
                          ref={amountInputRef}
                          id="donate-amount"
                          type="text"
                          inputMode="decimal"
                          maxLength={MAX_AMOUNT_DIGITS}
                          value={amountDraft}
                          onChange={(e) =>
                            setAmountDraft(
                              e.target.value
                                .replace(/[^\d.]/g, "")
                                .replace(/(\..*)\./g, "$1"),
                            )
                          }
                          onBlur={commitAmount}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitAmount();
                            }
                          }}
                          className="w-full min-w-0 bg-transparent font-manrope text-base font-medium text-white outline-none sm:text-sm"
                        />
                      </div>
                    ) : (
                      <Typography
                        variant="body-8"
                        as="span"
                        className="min-w-0 truncate font-manrope font-medium text-white"
                      >
                        {formattedAmount}
                      </Typography>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={editingAmount ? commitAmount : startAmountEdit}
                    className="min-h-[44px] w-[72px] shrink-0 rounded border border-white/45 font-manrope text-xs font-semibold tracking-[0.12em] text-white transition hover:border-[#FCCC2D] hover:text-[#FCCC2D] sm:w-20"
                  >
                    {editingAmount ? "DONE" : "EDIT"}
                  </button>
                </div>
              </div>

              {/* Placeholders carry the labels (labels stay for screen readers) so every field is a single row */}
              <div className="grid grid-cols-2 items-start gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
                <div className={underlineField}>
                  <FieldLabel htmlFor="donate-full-name" className="sr-only">
                    Full Name
                  </FieldLabel>
                  <input
                    id="donate-full-name"
                    required
                    name="fullName"
                    autoComplete="name"
                    placeholder="Full Name*"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={underlineInput}
                  />
                </div>

                <div className={underlineField}>
                  <FieldLabel htmlFor="donate-city" className="sr-only">
                    City
                  </FieldLabel>
                  <input
                    id="donate-city"
                    required
                    name="city"
                    autoComplete="address-level2"
                    placeholder="City*"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={underlineInput}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <FieldLabel htmlFor="donate-phone" className="sr-only">
                    Phone Number
                  </FieldLabel>
                  <div className={`flex items-center gap-2 ${underlineField}`}>
                    <CountrySelect
                      value={phoneCountryCode}
                      onChange={(nextCode) => {
                        setPhoneCountryCode(nextCode);
                        setPhone("");
                      }}
                      variant="dial"
                    />
                    <input
                      id="donate-phone"
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      placeholder="Phone Number*"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          nationalPhoneDigits(
                            e.target.value,
                            phoneCountry.dial,
                            phone,
                          ),
                        )
                      }
                      className={`${underlineInput} flex-1`}
                    />
                  </div>
                </div>

                <div className={`col-span-2 sm:col-span-1 ${underlineField}`}>
                  <FieldLabel htmlFor="donate-email" className="sr-only">
                    Email Address
                  </FieldLabel>
                  <input
                    id="donate-email"
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email Address*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={underlineInput}
                  />
                </div>

                {!international ? (
                  <div className={`col-span-2 sm:col-span-1 ${underlineField}`}>
                    <FieldLabel htmlFor="donate-pan" className="sr-only">
                      ID Card (PAN or Aadhaar – optional, required only for 80G
                      certificate)
                    </FieldLabel>
                    <input
                      id="donate-pan"
                      name="pan"
                      placeholder="PAN / Aadhaar (for 80G)"
                      title="Optional – required only for the 80G tax certificate"
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      maxLength={20}
                      className={underlineInput}
                    />
                  </div>
                ) : null}

                <div
                  className={`col-span-2 ${international ? "" : "sm:col-span-1"} ${underlineField}`}
                >
                  <FieldLabel htmlFor="donate-message" className="sr-only">
                    Leave a Message of Hope
                  </FieldLabel>
                  <textarea
                    ref={messageRef}
                    id="donate-message"
                    name="message"
                    rows={1}
                    placeholder="Message of hope (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${underlineInput} max-h-[5.5rem] resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
                  />
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="-my-1 font-manrope text-sm text-[#FFE08A]"
                >
                  {error}
                </p>
              ) : null}

              <div className="hidden min-w-0 items-center gap-3 [@media(min-width:640px)_and_(min-height:761px)]:flex">
                <div className="flex shrink-0 -space-x-2">
                  {donorAvatars.map((src, i) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={24}
                      height={24}
                      style={{ zIndex: donorAvatars.length - i }}
                      className="h-6 w-6 rounded-full border border-white/50"
                    />
                  ))}
                </div>
                <Typography
                  variant="body-8"
                  as="p"
                  className="min-w-0 flex-1 font-manrope font-light leading-snug text-white/90"
                >
                  126 kind donors have contributed this month. Join with them
                  today. ❤️
                </Typography>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded bg-[#FCCC2D] px-4 py-3 font-manrope font-bold text-[#3A2E00] transition-opacity disabled:opacity-60"
                >
                  <Typography
                    variant="button-1"
                    as="span"
                    className="block truncate"
                  >
                    {loading
                      ? "Please wait…"
                      : `Pay Securely ${formattedAmount}`}
                  </Typography>
                </button>

                <div className="flex items-center justify-center gap-1.5">
                  <Lock className="h-4 w-4 text-white/70" />
                  <Typography
                    variant="caption-1"
                    as="span"
                    className="font-manrope font-light text-white/60"
                  >
                    Secure Payment • Trusted by Thousands
                  </Typography>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}