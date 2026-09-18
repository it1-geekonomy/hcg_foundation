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
  DEFAULT_COUNTRY_CODE,
  getDonationCountry,
  isIndiaCountry,
} from "@/domains/home/constants/countries";
import CountrySelect from "@/shared/components/CountrySelect";
import { donorsApi } from "@/shared/lib/donors-api";

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

const underlineInput =
  "w-full bg-transparent py-1.5 font-manrope text-sm text-white outline-none placeholder:text-white/30";

type Props = {
  amount: number;
  onClose: () => void;
  onAmountChange?: (amount: number) => void;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block font-manrope text-[13px] font-normal text-white/85"
    >
      {children}
    </label>
  );
}

function nationalPhoneDigits(value: string, dialCode: string) {
  let digits = value.replace(/\D/g, "");
  const dialDigits = dialCode.replace(/\D/g, "");
  if (dialDigits && digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
    digits = digits.slice(dialDigits.length);
  }
  const maxNational = Math.max(6, 15 - dialDigits.length);
  return digits.slice(0, maxNational);
}

export default function DonateDetailsModal({
  amount,
  onClose,
  onAmountChange,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [pan, setPan] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [amountValue, setAmountValue] = useState(amount);
  const [amountDraft, setAmountDraft] = useState(String(amount));
  const [editingAmount, setEditingAmount] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
  const country = getDonationCountry(countryCode);
  const international = !isIndiaCountry(countryCode);

  function changeCountry(code: string) {
    setCountryCode(code);
    setPhone((prev) =>
      nationalPhoneDigits(prev, getDonationCountry(code).dialCode),
    );
  }

  function startAmountEdit() {
    setEditingAmount(true);
    setAmountDraft(String(amountValue));
    setError(null);
  }

  function commitAmount() {
    const next = Number(amountDraft.replace(/[^\d]/g, ""));
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

    const national = nationalPhoneDigits(phone, country.dialCode);
    if (international) {
      if (national.length < 6) {
        setError("Please enter a valid phone number.");
        return;
      }
    } else if (national.length !== 10) {
      setError("Please enter a 10-digit phone number.");
      return;
    }

    const payloadPhone = international
      ? `${country.dialCode}${national}`
      : national;

    setLoading(true);
    try {
      const res = await donorsApi.createOrder({
        fullName: fullName.trim(),
        phone: payloadPhone,
        email: email.trim(),
        city: city.trim() || undefined,
        country: country.name,
        isInternational: international,
        pan: international ? undefined : pan.replace(/\s/g, "") || undefined,
        message: message.trim() || undefined,
        amount: amountValue,
      });

      const checkout = res.data;
      if (!window.Razorpay) {
        throw new Error("Payment widget is still loading. Please try again.");
      }

      const useInternationalCheckout = checkout.isInternational === true;
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
          method: useInternationalCheckout ? "card" : undefined,
        },
        method: useInternationalCheckout
          ? {
              card: true,
              netbanking: false,
              upi: false,
              wallet: false,
              emi: false,
              paylater: false,
            }
          : undefined,
        config: useInternationalCheckout
          ? {
              display: {
                hide: [
                  { method: "upi" },
                  { method: "netbanking" },
                  { method: "wallet" },
                  { method: "emi" },
                  { method: "paylater" },
                ],
              },
            }
          : undefined,
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
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#1c1c1c]/70 px-4 py-8 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-details-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] rounded-md border border-white/15 p-5 shadow-2xl backdrop-blur-md sm:p-10"
        style={{ backgroundColor: donateTheme.glassBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close donation form"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded text-white/70 transition hover:text-[#FCCC2D]"
        >
          <X className="h-4 w-4" />
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
              className="mt-3 px-4 font-argestadisplay font-light leading-snug text-white/70"
            >
              Your donation of {formattedAmount} was received.
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
          <form onSubmit={onSubmit} className="flex flex-col">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <Image
                  src={donateIcon}
                  alt=""
                  width={26}
                  height={26}
                  className="h-7 w-7"
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
                className="max-w-[360px] px-2 font-argestadisplay font-light leading-snug text-white/70"
              >
                Your contribution helps us provide care, support and hope to
                those who need it most.
              </Typography>
            </div>

            <Typography
              variant="body-8"
              as="p"
              className="mb-2 font-manrope font-normal text-white"
            >
              Chosen Amount.
            </Typography>
            <div className="mb-8 flex items-stretch gap-3">
              <div className="flex min-h-[44px] flex-1 items-center rounded border border-[#FCCC2D] bg-[#8A7A28] px-4">
                {editingAmount ? (
                  <div className="flex w-full min-w-0 items-center gap-1">
                    <span className="shrink-0 font-manrope text-sm font-medium text-white">
                      ₹
                    </span>
                    <input
                      ref={amountInputRef}
                      id="donate-amount"
                      type="text"
                      inputMode="numeric"
                      value={amountDraft}
                      onChange={(e) =>
                        setAmountDraft(e.target.value.replace(/\D/g, ""))
                      }
                      onBlur={commitAmount}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitAmount();
                        }
                      }}
                      className="w-full min-w-0 bg-transparent font-manrope text-sm font-medium text-white outline-none"
                    />
                  </div>
                ) : (
                  <Typography
                    variant="body-8"
                    as="span"
                    className="font-manrope font-medium text-white"
                  >
                    {formattedAmount}
                  </Typography>
                )}
              </div>
              <button
                type="button"
                onClick={editingAmount ? commitAmount : startAmountEdit}
                className="min-h-[44px] shrink-0 rounded border border-white/45 px-5 font-manrope text-xs font-semibold tracking-[0.12em] text-white transition hover:border-[#FCCC2D] hover:text-[#FCCC2D]"
              >
                {editingAmount ? "DONE" : "EDIT"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="min-w-0">
                <FieldLabel htmlFor="donate-full-name">Full Name*</FieldLabel>
                <div className="border-b border-white/35">
                  <input
                    id="donate-full-name"
                    required
                    name="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={underlineInput}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <FieldLabel htmlFor="donate-phone">Phone Number*</FieldLabel>
                <div className="relative min-w-0">
                  <div className="flex min-w-0 items-center gap-2 border-b border-white/35">
                    <div className="shrink-0">
                      <CountrySelect
                        value={countryCode}
                        onChange={changeCountry}
                        variant="dial"
                      />
                    </div>
                    <input
                      id="donate-phone"
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          nationalPhoneDigits(e.target.value, country.dialCode),
                        )
                      }
                      className="min-w-0 flex-1 bg-transparent py-1.5 font-manrope text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>
                {international ? (
                  <p className="mt-1.5 font-manrope text-[11px] font-light text-white/60">
                    International donor — card payment in INR
                  </p>
                ) : null}
              </div>

              <div className="min-w-0">
                <FieldLabel htmlFor="donate-email">Email Address*</FieldLabel>
                <div className="border-b border-white/35">
                  <input
                    id="donate-email"
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={underlineInput}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <FieldLabel htmlFor="donate-city">City*</FieldLabel>
                <div className="border-b border-white/35">
                  <input
                    id="donate-city"
                    required
                    name="city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={underlineInput}
                  />
                </div>
              </div>
            </div>

            {!international ? (
              <div className="mt-6">
                <FieldLabel htmlFor="donate-pan">
                  ID Card{" "}
                  <span className="text-white/55">
                    (PAN or Aadhaar – Optional, required only for 80G
                    certificate)
                  </span>
                </FieldLabel>
                <div className="border-b border-white/35">
                  <input
                    id="donate-pan"
                    name="pan"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    maxLength={20}
                    className={underlineInput}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <FieldLabel htmlFor="donate-message">
                Leave a Message of Hope :)
              </FieldLabel>
              <div className="border-b border-white/35">
                <textarea
                  id="donate-message"
                  name="message"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${underlineInput} resize-none`}
                />
              </div>
            </div>

            {error ? (
              <p className="mt-4 font-manrope text-sm text-[#FFE08A]">{error}</p>
            ) : null}

            <div className="mt-8 flex min-w-0 items-start gap-3">
              <div className="flex shrink-0 -space-x-2 pt-0.5">
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
                className="min-w-0 flex-1 font-manrope text-[11px] font-light leading-snug text-white/90 sm:text-sm"
              >
                126 kind donors have contributed this month. Join with them
                today.❤️
              </Typography>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded bg-[#FCCC2D] py-3.5 font-manrope font-bold text-[#3A2E00] disabled:opacity-60"
            >
              <Typography variant="button-1" as="span">
                {loading ? "Please wait…" : `Pay Securely ${formattedAmount}`}
              </Typography>
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <Lock className="h-4 w-4 text-white/70" />
              <Typography
                variant="caption-1"
                as="span"
                className="font-manrope font-light text-white/60"
              >
                Secure Payment • Trusted by Thousands
              </Typography>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
