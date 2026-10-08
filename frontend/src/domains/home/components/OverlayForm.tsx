"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  HandCoins,
  HeartHandshake,
  Microscope,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { LayoutGroup } from "framer-motion";
import {
  IMPACT_ITEMS,
  OVERLAY_AMOUNT_PRESETS,
} from "@/domains/home/constants/overlayform";
import Typography from "@/lib/Typography";
import DonateDetailsModal from "@/shared/components/DonateDetailsModal";
import { Terms80GLink } from "@/shared/components/Terms80GDialog";
import type { DonationCategory } from "@/shared/lib/donors-api";
import CountrySelect from "@/shared/components/CountrySelect";
import {
  DEFAULT_COUNTRY_CODE,
  getDonationCountry,
} from "@/domains/home/constants/countries";
import {
  type DonationCurrencyCode,
  formatDonationAmount,
  getDonationCurrency,
} from "@/domains/home/constants/donation-currency";
import { ActivePill, CardReveal, OverlayBackdrop } from "./overlayFormMotion";

/**
 * Shrinks the card only when it is taller than the nearest `[data-fit-host]` ancestor, never
 * below `minScale`.
 *
 * With `fillWidth`, the card is laid out wider before scaling so it still spans the full
 * width afterwards; the wider layout wraps less text, so it also needs less shrinking.
 */
function FitViewport({
  className,
  minScale = 0,
  fillWidth = false,
  children,
}: {
  className?: string;
  minScale?: number;
  fillWidth?: boolean;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;

    const layoutAt = (scale: number) => {
      const widen = fillWidth && scale < 0.999;
      inner.style.width = widen ? `${100 / scale}%` : "";
      inner.style.marginInline = widen ? `${50 - 50 / scale}%` : "";
      inner.style.flexShrink = widen ? "0" : "";
      return inner.offsetHeight;
    };

    let frameId = 0;
    const fit = () => {
      const host = frame.closest<HTMLElement>("[data-fit-host]") ?? frame.parentElement;
      if (!host || host.clientHeight === 0) return;
      inner.style.transform = "none";
      frame.style.height = "auto";
      const available = host.clientHeight;
      let needed = layoutAt(1);
      let next = needed > available + 1 && needed > 0 ? available / needed : 1;
      if (fillWidth && next < 0.999) {
        let lo = next;
        let hi = 1;
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          if (layoutAt(mid) * mid <= available) lo = mid;
          else hi = mid;
        }
        next = lo;
      }
      next = Math.max(next, minScale);
      needed = layoutAt(next);
      if (next < 0.999) {
        inner.style.transformOrigin = "top center";
        inner.style.transform = `scale(${next})`;
        frame.style.height = `${Math.floor(needed * next)}px`;
      } else {
        inner.style.transform = "";
        inner.style.transformOrigin = "";
        frame.style.height = "";
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(fit);
    };

    fit();
    const observer = new ResizeObserver(schedule);
    observer.observe(inner);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [minScale, fillWidth]);

  return (
    <div ref={frameRef} className={className}>
      {/* self-start: if the frame's fixed height stretched this box, content growth (e.g. the
          terms error) would never resize it and the ResizeObserver would not refit. */}
      <div ref={innerRef} className="w-full self-start">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portrait asset + backdrop                                           */
/* ------------------------------------------------------------------ */

const PORTRAIT_SRC = "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791283199024-7slhm-donation-pop-up-1.webp";
/** Background image used only below 1024px (the desktop modal keeps PORTRAIT_SRC). */
const PORTRAIT_SRC_COMPACT = "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791454899916-wb1zg-donation-pop-up-1-2-.webp";
const PORTRAIT_ALT = "Cancer patient and her daughter embracing, both smiling";

function PortraitWithBackdrop({
  className = "",
  imageClassName = "",
  priority = false,
  sizes,
  fit = "contain",
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  fit?: "contain" | "cover";
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute -inset-8 z-0 rounded-[40%] blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, #FAD881 0%, rgba(250,216,129,0) 100%)",
        }}
      />
      <div className="relative z-10 h-full w-full overflow-hidden">
        <Image
          src={PORTRAIT_SRC}
          alt={PORTRAIT_ALT}
          fill
          priority={priority}
          sizes={sizes}
          className={`${fit === "cover" ? "object-cover" : "object-contain"} object-left-bottom ${imageClassName}`}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root component                                                      */
/* ------------------------------------------------------------------ */

export default function OverlayForm({ onClose }: { onClose: () => void }) {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const country = getDonationCountry(countryCode);
  const currency: DonationCurrencyCode = country.currency;
  const currencyMeta = getDonationCurrency(currency);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    OVERLAY_AMOUNT_PRESETS[0],
  );
  const [selectedImpact, setSelectedImpact] = useState<DonationCategory | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [agreedTo80G, setAgreedTo80G] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { body } = document;
    body.dataset.donationOverlayOpen = "true";
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
      delete body.dataset.donationOverlayOpen;
      Object.assign(body.style, original);
      window.scrollTo(0, scrollY);
    };
  }, []);

  const changeCountry = (nextCode: string) => {
    const next = getDonationCountry(nextCode);
    setCountryCode(next.code);
    setShowCustomInput(false);
    setCustomAmount("");
    setSelectedPreset(OVERLAY_AMOUNT_PRESETS[0]);
    setTermsError(false);
  };

  const pickPreset = (amount: number) => {
    setSelectedPreset(amount);
    setShowCustomInput(false);
    setCustomAmount("");
  };

  const commitCustomAmount = () => {
    const numeric = customAmount.trim().replace(/[^\d]/g, "");
    if (numeric) {
      setCustomAmount(numeric);
      setSelectedPreset(null);
    }
    setShowCustomInput(false);
  };

  const handleCustomAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitCustomAmount();
    } else if (e.key === "Escape") {
      setShowCustomInput(false);
      setCustomAmount("");
    }
  };

  const donationAmount = selectedPreset ?? (Number(customAmount) || 0);

  const openDetailsForm = () => {
    setTermsError(!agreedTo80G);
    if (!agreedTo80G) return;
    setDetailsOpen(true);
  };

  const amountProps: AmountProps = {
    selectedPreset,
    onSelectPreset: pickPreset,
    showCustomInput,
    customAmount,
    onCustomAmountChange: setCustomAmount,
    onMoreClick: () => setShowCustomInput(true),
    onCustomAmountKeyDown: handleCustomAmountKeyDown,
    onCustomAmountBlur: commitCustomAmount,
    countryCode,
    changeCountry,
    currency,
    currencyMeta,
    agreedTo80G,
    setAgreedTo80G,
    termsError,
    setTermsError,
    onDonateClick: openDetailsForm,
    selectedImpact,
    onSelectImpact: setSelectedImpact,
  };

  return (
    <>
      <OverlayBackdrop
        className="fixed inset-0 z-50 h-[100dvh] overflow-hidden overflow-clip overscroll-none px-2 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-6 lg:pt-[max(2.5rem,8vh)] lg:pb-[max(2.5rem,8vh)]"
        role="dialog"
        aria-modal={true}
        aria-labelledby="donation-modal-title"
      >
        <div data-fit-host className="h-full overflow-hidden overscroll-none lg:hidden">
          <div className="flex min-h-full items-center justify-center">
            <LayoutGroup id="overlay-compact">
              <FitViewport className="flex w-full justify-center" fillWidth>
                <ModalBelow1024 {...amountProps} onClose={onClose} />
              </FitViewport>
            </LayoutGroup>
          </div>
        </div>
        <div className="hidden lg:flex lg:h-full lg:items-center lg:justify-center">
          <LayoutGroup id="overlay-wide">
            <FitViewport className="flex w-full justify-center">
              <Modal1024Up {...amountProps} onClose={onClose} />
            </FitViewport>
          </LayoutGroup>
        </div>
      </OverlayBackdrop>

      {detailsOpen ? (
        <DonateDetailsModal
          amount={donationAmount}
          currency={currency}
          countryCode={countryCode}
          donationCategory={selectedImpact ?? undefined}
          onClose={() => setDetailsOpen(false)}
          onAmountChange={(next) => {
            setCustomAmount(String(next));
            setSelectedPreset(null);
          }}
        />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

type AmountProps = {
  selectedPreset: number | null;
  onSelectPreset: (amount: number) => void;
  showCustomInput: boolean;
  customAmount: string;
  onCustomAmountChange: (value: string) => void;
  onMoreClick: () => void;
  onCustomAmountKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCustomAmountBlur: () => void;
  countryCode: string;
  changeCountry: (nextCode: string) => void;
  currency: DonationCurrencyCode;
  currencyMeta: ReturnType<typeof getDonationCurrency>;
  agreedTo80G: boolean;
  setAgreedTo80G: (value: boolean) => void;
  termsError: boolean;
  setTermsError: (value: boolean) => void;
  onDonateClick: () => void;
  selectedImpact: DonationCategory | null;
  onSelectImpact: (category: DonationCategory | null) => void;
};

/* ------------------------------------------------------------------ */
/* Shared sub-components                                               */
/* ------------------------------------------------------------------ */

function CloseButton({
  onClose,
  className,
}: {
  onClose: () => void;
  className: string;
}) {
  return (
    <button
      onClick={onClose}
      aria-label="Close donation form"
      className={className}
    >
      <X className="h-4 w-4" strokeWidth={2} aria-hidden />

    </button>
  );
}

function Heading({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Typography
        id="donation-modal-title"
        variant="heading-2"
        as="h2"
        className="font-serif leading-tight text-black lg:!text-[2rem] lg:!leading-[1.15] 2xl:!text-[2.125rem]"
      >
        <span className="font-medium font-tiempos-fine tracking-wide">Bring Hope</span>{" "}
        <span className="bg-[#F9BF16] bg-clip-text text-transparent font-medium font-tiempos-fine tracking-wide">
          Beyond Cancer
        </span>
      </Typography>
      <Typography
        variant="body-9"
        as="p"
        className="mt-1.5 max-w-2xl !text-[0.875rem] !leading-[1.5] text-pretty text-[#3A3836] font-argestadisplay font-normal lg:mt-1 lg:max-w-[36rem] lg:!text-[0.9375rem]"
      >
        Your support provides cancer care, emotional support, and financial aid to those in need.
      </Typography>
    </div>
  );
}

function GoldCheckbox({
  checked,
  onChange,
  ariaLabel,
  invalid = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  return (
    <span className="relative flex h-3.5 w-3.5 shrink-0 lg:h-4 lg:w-4">
      <input
        type="checkbox"
        checked={checked}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.checked)}
        className={`peer h-3.5 w-3.5 cursor-pointer appearance-none rounded-[5px] border-[1.5px] bg-white transition-colors focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/60 focus-visible:outline-none lg:h-4 lg:w-4 ${
          invalid
            ? "border-[#B45309]"
            : "border-[#BDB3A3] hover:border-[#8F8576] checked:border-[#E2B000] checked:bg-[#FCCC2D]"
        }`}
      />
      <Check
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 text-[#3A2E00] opacity-0 peer-checked:opacity-100 lg:h-3 lg:w-3"
      />
    </span>
  );
}

function ImpactItems({
  className,
  selectedImpact,
  onSelectImpact,
}: {
  className: string;
  selectedImpact: DonationCategory | null;
  onSelectImpact: (category: DonationCategory | null) => void;
}) {
  const labelId = useId();

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Typography
          id={labelId}
          variant="body-8"
          as="p"
          className={`font-semibold font-manrope tracking-normal text-[#1C1C1C] ${LG_FIELD_TEXT}`}
        >
          Choose a cause
        </Typography>
        {selectedImpact ? (
          <button
            type="button"
            onClick={() => onSelectImpact(null)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full text-[#8A6A00] transition-colors hover:text-[#5C4600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/60"
          >
            <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            <Typography variant="caption-1" as="span" className="font-manrope font-semibold">
              Clear
            </Typography>
          </button>
        ) : (
          <Typography
            variant="caption-1"
            as="span"
            className="font-manrope font-normal text-[#6F6863]"
          >
            Optional
          </Typography>
        )}
      </div>

      <div className={className} role="group" aria-labelledby={labelId}>
        {IMPACT_ITEMS.map((item) => {
          const selected = selectedImpact === item.title;
          const Icon = IMPACT_ICONS[item.title] ?? HandCoins;
          return (
            <button
              key={item.title}
              type="button"
              aria-pressed={selected}
              onClick={(e) =>
                // e.detail is 2 on the second click of a double-click, so a double-click always ends unselected.
                onSelectImpact(selected || e.detail >= 2 ? null : item.title)
              }
              className={`grid min-w-0 select-none cursor-pointer grid-cols-[auto_1fr] content-start items-center gap-x-3 gap-y-0.5 rounded-xl border px-3 py-1.5 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/60 lg:gap-x-2.5 lg:gap-y-1 lg:px-2.5 lg:py-2 ${
                selected
                  ? "border-[#E8B923] bg-[#FFF8E1] shadow-[0_0_0_3px_rgba(252,204,45,0.16)]"
                  : "border-[#EEE8DC] bg-transparent hover:border-[#DCCFB8] hover:bg-white/40 lg:bg-white lg:hover:bg-[#FDFBF6]"
              }`}
            >
              <span
                aria-hidden
                className={`row-span-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 lg:row-span-1 lg:h-6 lg:w-6 lg:rounded-md ${
                  selected ? "bg-[#FCCC2D] text-[#3A2E00]" : "bg-[#F6F1E6] text-[#9A7400]"
                }`}
              >
                {selected ? (
                  <Check className="h-4 w-4 lg:h-3.5 lg:w-3.5" strokeWidth={3} />
                ) : (
                  <Icon className="h-4 w-4 lg:h-3.5 lg:w-3.5" strokeWidth={2} />
                )}
              </span>
              <Typography
                variant="body-7"
                as="span"
                className="min-w-0 !text-left !text-[0.875rem] !leading-tight font-semibold font-manrope text-[#1C1C1C] lg:!text-[0.8125rem]"
              >
                {item.title}
              </Typography>
              <Typography
                variant="caption-1"
                as="span"
                className="col-start-2 block !text-left !leading-[1.4] text-pretty font-manrope font-normal text-[#6F6863] lg:col-span-2 lg:col-start-1"
              >
                {item.desc}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const IMPACT_ICONS: Partial<Record<DonationCategory, LucideIcon>> = {
  "Financial Assistance": HandCoins,
  "Awareness & Prevention": ShieldCheck,
  "Psychological Support": HeartHandshake,
  "Research & Innovation": Microscope,
};


/** Shared look for every input box in the form: soft warm border, pill shape, one height. */
const FIELD_BORDER = "border-[#E6DFD2]";
const FIELD_HOVER = "hover:border-[#C9BEAC]";

const pillBase =
  "relative flex h-11 cursor-pointer items-center justify-center rounded-full border bg-white font-semibold transition-colors duration-300 lg:h-9";
/** Desktop-only size for field labels and pill text; mobile keeps the type scale. */
const LG_FIELD_TEXT = "lg:!text-[0.875rem]";
const pillActive = "border-[#1C1C1C] text-white";
const pillInactive = `${FIELD_BORDER} ${FIELD_HOVER} text-[#2B2B2B]`;

function AmountPicker({
  selectedPreset,
  onSelectPreset,
  showCustomInput,
  customAmount,
  onCustomAmountChange,
  onMoreClick,
  onCustomAmountKeyDown,
  onCustomAmountBlur,
  currency,
  currencyMeta,
  gridClassName,
  pillWidthClassName = "",
  inputSpanClassName = "",
}: AmountProps & {
  gridClassName: string;
  pillWidthClassName?: string;
  inputSpanClassName?: string;
}) {
  const customInputRef = useRef<HTMLInputElement>(null);
  const isCustom = selectedPreset === null;

  useEffect(() => {
    if (showCustomInput) customInputRef.current?.focus();
  }, [showCustomInput]);

  return (
    <div>
      <Typography
        variant="body-8"
        as="p"
        className={`font-semibold font-manrope tracking-normal text-[#1C1C1C] ${LG_FIELD_TEXT}`}
      >
        Choose an amount
      </Typography>

      <div className={gridClassName}>
        {OVERLAY_AMOUNT_PRESETS.map((amount) => {
          const active = amount === selectedPreset;
          return (
            <button
              key={`${currency}-${amount}`}
              onClick={() => onSelectPreset(amount)}
              aria-pressed={active}
              className={`${pillWidthClassName} ${pillBase} ${active ? pillActive : pillInactive}`}
            >
              {active ? <ActivePill /> : null}
              <Typography variant="body-8" as="span" className={`relative font-semibold font-manrope ${LG_FIELD_TEXT}`}>
                {formatDonationAmount(amount, currency)}
              </Typography>
            </button>
          );
        })}

        {showCustomInput ? (
          <div
            className={`${inputSpanClassName} flex h-11 items-center justify-center gap-1 rounded-full border border-[#1C1C1C] bg-white px-3 lg:h-9`}
          >
            <Typography variant="body-8" as="span" className={`font-semibold font-manrope text-gray-700 ${LG_FIELD_TEXT}`}>
              {currencyMeta.symbol}
            </Typography>
            <input
              ref={customInputRef}
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value.replace(/\D/g, ""))}
              onKeyDown={onCustomAmountKeyDown}
              onBlur={onCustomAmountBlur}
              placeholder="0"
              className="w-14 min-w-0 bg-transparent font-semibold font-manrope text-[#1C1C1C] outline-none placeholder:font-normal placeholder:text-gray-400 lg:text-[0.875rem]"
            />
          </div>
        ) : (
          <button
            onClick={onMoreClick}
            aria-pressed={isCustom}
            className={`${pillWidthClassName} ${pillBase} ${isCustom ? pillActive : pillInactive}`}
          >
            {isCustom ? <ActivePill /> : null}
            <Typography variant="body-8" as="span" className={`relative font-semibold font-manrope ${LG_FIELD_TEXT}`}>
              {isCustom && customAmount
                ? formatDonationAmount(Number(customAmount), currency)
                : "Other"}
            </Typography>
          </button>
        )}
      </div>
    </div>
  );
}

function DonateButton({
  className,
  onDonateClick,
  showHeart = true,
}: {
  className: string;
  onDonateClick: () => void;
  showHeart?: boolean;
}) {
  return (
    <button onClick={onDonateClick} className={className}>
      <Typography variant="button-6" as="span" className="font-bold font-manrope text-gray-900 lg:!text-[0.9375rem]">
        {showHeart ? "❤️ " : ""}DONATE NOW →
      </Typography>
    </button>
  );
}

function CountryBlock({
  countryCode,
  changeCountry,
  currencyMeta,
  className = "flex flex-col gap-2 mb-3 w-full max-w-[280px] sm:max-w-[320px]",
  inlineCurrency = false,
}: Pick<AmountProps, "countryCode" | "changeCountry" | "currencyMeta"> & {
  className?: string;
  /** Show the currency on the label row instead of its own line under the select. */
  inlineCurrency?: boolean;
}) {
  const currencyNote = (
    <Typography
      variant="caption-1"
      as="span"
      className="font-manrope font-normal text-[#6F6863]"
    >
      Currency: {currencyMeta.label}
    </Typography>
  );

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <Typography
          variant="body-8"
          as="span"
          className={`font-semibold font-manrope tracking-normal text-[#1C1C1C] ${LG_FIELD_TEXT}`}
        >
          Country
        </Typography>
        {inlineCurrency ? currencyNote : null}
      </div>
      <CountrySelect
        value={countryCode}
        onChange={changeCountry}
        variant="name"
        theme="light"
        borderClassName={`${FIELD_BORDER} ${FIELD_HOVER}`}
        boxClassName="h-11 gap-2.5 rounded-full bg-[#FBF9F4] px-4 transition-colors lg:h-9"
        chevronClassName="text-[#6F6863]"
        textClassName="text-[#1C1C1C]"
      />
      {inlineCurrency ? null : currencyNote}
    </div>
  );
}

function TermsCheckbox({
  agreedTo80G,
  setAgreedTo80G,
  termsError,
  setTermsError,
}: Pick<AmountProps, "agreedTo80G" | "setAgreedTo80G" | "termsError" | "setTermsError">) {
  return (
    <div className="mt-3 flex flex-col gap-1 lg:mt-2.5">
      <label className="flex min-w-0 cursor-pointer items-start gap-3">
        <GoldCheckbox
          checked={agreedTo80G}
          invalid={termsError}
          onChange={(checked) => {
            setAgreedTo80G(checked);
            if (checked) setTermsError(false);
          }}
        />
        <Typography
          variant="caption-1"
          as="span"
          className="min-w-0 flex-1 font-manrope font-normal leading-relaxed text-[#4A4540] lg:!leading-snug"
        >
          I have read and agree to the applicable{" "}
          <Terms80GLink
            className="font-semibold text-[#7A5A00]"
            onAgree={() => {
              setAgreedTo80G(true);
              setTermsError(false);
            }}
          />{" "}
          for this donation.
        </Typography>
      </label>

      {termsError ? (
        <Typography
          variant="caption-1"
          as="p"
          role="alert"
          className="pl-7 font-manrope font-normal leading-snug text-[#B45309]"
        >
          Please agree to the 80G Terms &amp; Conditions to continue.
        </Typography>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal — 1024px and above                                            */
/* ------------------------------------------------------------------ */

function Modal1024Up({
  onClose,
  ...amountProps
}: AmountProps & { onClose: () => void }) {
  const { countryCode, changeCountry, currencyMeta, agreedTo80G, setAgreedTo80G, termsError, setTermsError, onDonateClick } =
    amountProps;

  return (
    <CardReveal
      frameClassName="mx-auto w-full max-w-[800px] 2xl:max-w-[860px]"
      className="relative w-full overflow-hidden overflow-clip overscroll-none rounded-xl bg-white shadow-2xl"
    >
      <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-[60] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F4F0E8] text-[#1C1C1C] transition-colors hover:bg-[#EAE3D5]"
      />

      {/* Heading spans the full width of the card, above the image + content row */}
      <div className="relative z-30 flex w-full flex-col px-7 pt-4 2xl:px-8 2xl:pt-5">
        <Heading className="w-full pr-10" />
        <div className="mt-2 flex items-stretch gap-6 xl:gap-7">
          <div className="relative -ml-7 -mb-4 w-[42%] max-w-[340px] shrink-0 2xl:-ml-8 2xl:max-w-[360px]">
            <PortraitWithBackdrop
              className="h-full w-full"
              priority
              sizes="(min-width: 1536px) 360px, (min-width: 1024px) 340px, 0px"
            />
          </div>

          <div className="relative z-20 flex min-w-0 max-w-[440px] flex-1 flex-col justify-center pb-4">
            <ImpactItems
              className="grid grid-cols-2 gap-2"
              selectedImpact={amountProps.selectedImpact}
              onSelectImpact={amountProps.onSelectImpact}
            />

            <div className="mt-3 border-t border-[#EFE9DD] pt-3">
              <CountryBlock
                countryCode={countryCode}
                changeCountry={changeCountry}
                currencyMeta={currencyMeta}
                inlineCurrency
                className="mb-3 flex w-full flex-col gap-1.5"
              />

              <AmountPicker
                {...amountProps}
                gridClassName="mt-1.5 grid grid-cols-4 gap-2"
                pillWidthClassName="w-full px-2"
                inputSpanClassName="w-full"
              />

              <TermsCheckbox
                agreedTo80G={agreedTo80G}
                setAgreedTo80G={setAgreedTo80G}
                termsError={termsError}
                setTermsError={setTermsError}
              />

              <DonateButton
                onDonateClick={onDonateClick}
                showHeart={false}
                className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FDC61D] px-10 shadow-[0_8px_20px_-10px_rgba(226,176,0,0.8)] transition-colors hover:bg-[#F2B800]"
              />
            </div>
          </div>
        </div>
      </div>
    </CardReveal>
  );
}

/* ------------------------------------------------------------------ */
/* Modal — below 1024px                                                */
/* ------------------------------------------------------------------ */

function ModalBelow1024({
  onClose,
  ...amountProps
}: AmountProps & { onClose: () => void }) {
  const { countryCode, changeCountry, currencyMeta, agreedTo80G, setAgreedTo80G, termsError, setTermsError, onDonateClick } =
    amountProps;

  return (
    <CardReveal
      frameClassName="mx-auto w-[calc(100%-0.5rem)] max-w-[420px] sm:w-[calc(100%-1rem)] sm:max-w-[440px] md:max-w-[480px]"
      className="relative w-full overflow-hidden overscroll-none rounded-xl bg-white shadow-2xl"
    >
      <CloseButton
        onClose={onClose}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F4F0E8] leading-none text-[#1C1C1C] transition-colors hover:bg-[#EAE3D5]"
      />
      <Heading className="px-5 pr-12 pt-4 sm:px-7 sm:pt-5" />

      {/* Portrait as the background from just under the description to the bottom of the card
          (below 1024px only). Flat white overlay, no gradient; content sits above both. */}
      <div className="relative mt-3 flex flex-col items-center gap-1 px-5 pb-4 sm:mt-4 sm:px-7 sm:pb-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={PORTRAIT_SRC_COMPACT}
            alt=""
            fill
            sizes="(max-width: 1023px) 480px, 0px"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-white/50" />
        </div>

        <div className="relative z-10 flex min-w-0 w-full flex-1 flex-col items-center pb-0">
          <div className="mx-auto w-full">
            <ImpactItems
              className="grid grid-cols-1 gap-1.5 sm:gap-2"
              selectedImpact={amountProps.selectedImpact}
              onSelectImpact={amountProps.onSelectImpact}
            />

            <div className="mt-3 w-full border-t border-[#EFE9DD] pt-3 sm:mt-4 sm:pt-4">
              <CountryBlock
                countryCode={countryCode}
                changeCountry={changeCountry}
                currencyMeta={currencyMeta}
                inlineCurrency
                className="mb-2.5 flex w-full flex-col gap-1.5 sm:mb-3"
              />

              <AmountPicker
                {...amountProps}
                gridClassName="mt-1.5 grid grid-cols-4 gap-2"
                pillWidthClassName="w-full px-1"
                inputSpanClassName="w-full"
              />

              <TermsCheckbox
                agreedTo80G={agreedTo80G}
                setAgreedTo80G={setAgreedTo80G}
                termsError={termsError}
                setTermsError={setTermsError}
              />

              <DonateButton
                onDonateClick={onDonateClick}
                showHeart={false}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FDC61D] cursor-pointer shadow-[0_8px_20px_-10px_rgba(226,176,0,0.8)] sm:mt-4 sm:h-12"
              />
            </div>
          </div>
        </div>
      </div>
    </CardReveal>
  );
}