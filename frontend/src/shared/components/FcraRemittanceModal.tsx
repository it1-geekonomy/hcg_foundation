"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Mail, X } from "lucide-react";
import Typography from "@/lib/Typography";
import { donateTheme } from "@/domains/home/constants/donate";
import {
  FINANCE_TEAM_EMAIL,
  FINANCE_TEAM_LABEL,
} from "@/domains/home/constants/fcra-bank";
import { formatDonationAmount } from "@/domains/home/constants/donation-currency";

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
  currency: string;
  causeLabel: string;
  onClose: () => void;
  onDonateFromIndia: () => void;
};

export default function FcraRemittanceModal({
  amount,
  currency,
  causeLabel,
  onClose,
  onDonateFromIndia,
}: Props) {
  const [copied, setCopied] = useState(false);
  const formattedAmount = formatDonationAmount(amount, currency);

  const { mailtoHref, gmailHref } = useMemo(() => {
    const subject = `Foreign donation enquiry — ${formattedAmount} — ${causeLabel}`;
    const body = [
      "Hello HCG Foundation Finance Team,",
      "",
      "I am interested in making a foreign / overseas donation and would like guidance on the process.",
      "",
      `Intended amount: ${formattedAmount} (${currency})`,
      `Cause: ${causeLabel}`,
      "",
      "Please share the donation process and next steps.",
      "",
      "Thank you,",
    ].join("\n");

    return {
      mailtoHref: `mailto:${FINANCE_TEAM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      // Works in the browser even when no desktop mail app is installed (common in local testing).
      gmailHref: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(FINANCE_TEAM_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    };
  }, [formattedAmount, causeLabel, currency]);

  function goToContactForm() {
    // Close first so body scroll-lock cleanup runs, then do a full navigation.
    // Next.js client routing often drops the #hash while the modal is open.
    onClose();
    window.setTimeout(() => {
      window.location.assign("/contact#contact-form");
    }, 0);
  }

  function openFinanceEmail() {
    // Gmail compose works in the browser even when no desktop mail app is set
    // (mailto: often does nothing in local Chrome / Cursor browser).
    const opened = window.open(gmailHref, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = mailtoHref;
    }
  }

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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(FINANCE_TEAM_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="foreign-donation-title"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-3 py-4 sm:p-6">
        <div
          className="relative w-full max-w-[520px] rounded-md border border-white/15 px-5 py-6 shadow-2xl sm:px-10 sm:py-8"
          style={panelStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-[#FCCC2D] sm:right-3 sm:top-3"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center gap-5 text-center">
            <Mail className="h-8 w-8 text-[#FCCC2D]" aria-hidden />

            <div className="flex flex-col gap-1.5 px-2">
              <h3
                id="foreign-donation-title"
                className="font-tiempos-fine font-normal text-white"
              >
                <Typography variant="heading-6" as="span">
                  Foreign donations
                </Typography>
              </h3>
              <Typography
                variant="body-7"
                as="p"
                className="mx-auto max-w-[400px] font-argestadisplay font-light leading-snug text-white/70"
              >
                Planning to contribute from outside India? Please contact the{" "}
                {FINANCE_TEAM_LABEL} by email. Our team will guide you through
                the donation process and share the necessary bank details and
                instructions to complete your contribution.
              </Typography>
            </div>

            {(amount > 0 || causeLabel) && (
              <div className="w-full rounded-md border border-[#FCCC2D]/60 bg-[#FCCC2D]/10 px-3 py-2.5">
                <p className="font-manrope text-sm font-semibold text-[#FCCC2D]">
                  {formattedAmount}
                  <span className="mx-1.5 font-light text-white/50">·</span>
                  {causeLabel}
                </p>
              </div>
            )}

            <div className="w-full rounded-md border border-white/15 bg-black/20 px-4 py-4 text-left">
              <p className="font-manrope text-[11px] uppercase tracking-wide text-white/55">
                {FINANCE_TEAM_LABEL}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={openFinanceEmail}
                  className="min-w-0 break-all text-left font-manrope text-base font-semibold text-[#FCCC2D] underline-offset-2 hover:underline sm:text-lg"
                >
                  {FINANCE_TEAM_EMAIL}
                </button>
                <button
                  type="button"
                  onClick={() => void copyEmail()}
                  aria-label="Copy email address"
                  className="shrink-0 rounded p-2 text-white/60 transition hover:bg-white/10 hover:text-[#FCCC2D]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 font-manrope text-xs leading-snug text-white/60">
                Mention your intended amount when you write. We will reply with
                bank details and next steps.
              </p>
            </div>

            <button
              type="button"
              onClick={openFinanceEmail}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#FCCC2D] py-3 font-manrope font-bold text-[#3A2E00]"
            >
              <Mail className="h-4 w-4" />
              Email Finance Team
            </button>

            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onDonateFromIndia}
                className="flex-1 rounded border border-[#FCCC2D] px-3 py-2.5 font-manrope text-sm font-semibold text-[#FCCC2D] transition hover:bg-[#FCCC2D]/10"
              >
                Donate from India
              </button>
              <button
                type="button"
                onClick={goToContactForm}
                className="flex flex-1 items-center justify-center rounded border border-white/35 px-3 py-2.5 font-manrope text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
