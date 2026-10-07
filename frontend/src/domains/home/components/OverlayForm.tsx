"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import {
  IMPACT_ITEMS,
  OVERLAY_AMOUNT_PRESETS,
} from "@/domains/home/constants/overlayform";
import Typography from "@/lib/Typography";
import DonateDetailsModal from "@/shared/components/DonateDetailsModal";
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

/** Shrinks the card only when it is taller than the viewport, so nothing is cut off or scrolled. */
function FitViewport({ className, children }: { className?: string; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;

    let frameId = 0;
    const fit = () => {
      const host = frame.parentElement;
      if (!host || host.clientHeight === 0) return;
      inner.style.transform = "none";
      frame.style.height = "auto";
      const available = host.clientHeight;
      const needed = inner.offsetHeight;
      const next = needed > available + 1 && needed > 0 ? available / needed : 1;
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
  }, []);

  return (
    <div ref={frameRef} className={className}>
      <div ref={innerRef} className="w-full">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portrait asset + backdrop                                           */
/* ------------------------------------------------------------------ */

const PORTRAIT_SRC = "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791283199024-7slhm-donation-pop-up-1.webp";
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
        className="fixed inset-0 z-50 h-[100dvh] overflow-hidden overflow-clip overscroll-none p-2 lg:px-6 lg:py-8"
        role="dialog"
        aria-modal={true}
        aria-labelledby="donation-modal-title"
      >
        <div className="flex h-full items-center justify-center lg:hidden">
          <LayoutGroup id="overlay-compact">
            <FitViewport className="flex w-full justify-center">
              <ModalBelow1024 {...amountProps} onClose={onClose} />
            </FitViewport>
          </LayoutGroup>
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

function Heading({ className = "", centerOnMobile = false }: { className?: string; centerOnMobile?: boolean }) {
  const align = centerOnMobile ? "text-center" : "";
  const descAlign = centerOnMobile ? "mx-auto text-center" : "";
  return (
    <div className={className}>
      <Typography
        variant="heading-2"
        as="h2"
        className={`font-serif leading-tight text-black lg:!text-[2.125rem] lg:!leading-[1.15] xl:!text-[2.25rem] ${align}`}
      >
        <span className="font-medium font-tiempos-fine tracking-wide">Bring Hope</span>{" "}
        <span className="bg-[#F9BF16] bg-clip-text text-transparent font-medium font-tiempos-fine tracking-wide">
          Beyond Cancer
        </span>
      </Typography>
      <Typography
        variant="body-9"
        as="p"
        className={`mt-2 max-w-2xl leading-relaxed text-[#3A3836] font-argestadisplay font-normal lg:mt-1.5 lg:max-w-[36rem] lg:!text-[0.9375rem] lg:!leading-[1.55] ${descAlign}`}
      >
        Your contribution helps provide life-saving treatment, emotional
        care, and financial support to cancer patients and their families
        in need.
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
  return (
    <div className={className} role="group" aria-label="Choose where your donation helps">
      {IMPACT_ITEMS.map((item) => {
        const checked = selectedImpact === item.title;
        return (
          <label
            key={item.title}
            className="grid min-w-0 cursor-pointer grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0.5 text-left"
          >
            <GoldCheckbox
              checked={checked}
              ariaLabel={item.title}
              onChange={(next) => onSelectImpact(next ? item.title : null)}
            />
            <Typography
              variant="body-7"
              as="p"
              className="col-start-2 !text-left font-semibold font-manrope text-[#1C1C1C] lg:!text-[0.9rem] lg:!leading-snug"
            >
              {item.title}
            </Typography>
            <Typography
              variant="body-6"
              as="p"
              className="col-start-2 !text-left !text-[0.875rem] leading-snug tracking-normal text-[#6F6863] font-manrope font-normal lg:!text-[0.8125rem]"
            >
              {item.desc}
            </Typography>
          </label>
        );
      })}
    </div>
  );
}


/** Shared look for every input box in the form: soft warm border, pill shape, one height. */
const FIELD_BORDER = "border-[#E6DFD2]";
const FIELD_HOVER = "hover:border-[#C9BEAC]";

const pillBase =
  "relative flex h-11 cursor-pointer items-center justify-center rounded-full border bg-white font-semibold transition-colors duration-300 lg:h-10";
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
            className={`${inputSpanClassName} flex h-11 items-center justify-center gap-1 rounded-full border border-[#1C1C1C] bg-white px-3 lg:h-10`}
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
        borderClassName={`${FIELD_BORDER} ${FIELD_HOVER}`}
        boxClassName="h-11 gap-2.5 rounded-full bg-[#FBF9F4] px-4 transition-colors lg:h-10"
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
    <div className="mt-3 flex flex-col gap-1">
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
          className="min-w-0 flex-1 font-manrope font-normal leading-relaxed text-[#4A4540]"
        >
          I have read and agree to the applicable{" "}
          <span className="font-semibold text-[#B88A00]">
            80G Terms &amp; Conditions
          </span>{" "}
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
      frameClassName="mx-auto w-full max-w-[800px] xl:max-w-[840px] 2xl:max-w-[880px]"
      className="relative w-full overflow-hidden overflow-clip overscroll-none rounded-xl bg-white shadow-2xl"
    >
      <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-[60] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F4F0E8] text-[#1C1C1C] transition-colors hover:bg-[#EAE3D5]"
      />

      {/* Heading spans the full width of the card, above the image + content row */}
      <div className="relative z-30 flex w-full flex-col px-7 pt-5 2xl:px-8">
        <Heading className="w-full pr-10" />
        <div className="mt-2 flex items-stretch gap-6 xl:gap-7">
          <div className="relative -ml-7 -mb-4 w-[42%] max-w-[340px] shrink-0 xl:max-w-[360px] 2xl:-ml-8 2xl:max-w-[380px]">
            <PortraitWithBackdrop
              className="h-full w-full"
              priority
              sizes="(min-width: 1536px) 380px, (min-width: 1280px) 360px, (min-width: 1024px) 340px, 0px"
            />
          </div>

          <div className="relative z-20 flex min-w-0 max-w-[440px] flex-1 flex-col justify-center pb-4">
            <ImpactItems
              className="grid grid-cols-1 gap-y-2"
              selectedImpact={amountProps.selectedImpact}
              onSelectImpact={amountProps.onSelectImpact}
            />

            <div className="mt-3.5 border-t border-[#EFE9DD] pt-3.5">
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
                className="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FDC61D] px-10 shadow-[0_8px_20px_-10px_rgba(226,176,0,0.8)] transition-colors hover:bg-[#F2B800]"
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
      <Heading className="px-6 pr-10 pt-5 sm:px-8" centerOnMobile />

      <div className="mt-4 flex flex-col items-center gap-1 px-6 pb-5 sm:px-8">
        <div className="flex min-w-0 w-full flex-1 flex-col items-center pb-0">
          <div className="mx-auto w-full">
            <ImpactItems
              className="grid grid-cols-1 gap-y-2.5"
              selectedImpact={amountProps.selectedImpact}
              onSelectImpact={amountProps.onSelectImpact}
            />

            <div className="mt-4 w-full border-t border-[#EFE9DD] pt-4">
              <CountryBlock
                countryCode={countryCode}
                changeCountry={changeCountry}
                currencyMeta={currencyMeta}
                className="mb-3 flex w-full flex-col gap-1.5"
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
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FDC61D] cursor-pointer shadow-[0_8px_20px_-10px_rgba(226,176,0,0.8)]"
              />
            </div>
          </div>
        </div>
      </div>
    </CardReveal>
  );
}