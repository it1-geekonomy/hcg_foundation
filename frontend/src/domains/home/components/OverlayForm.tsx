"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  IMPACT_ITEMS,
} from "@/domains/home/constants/overlayform";
import Typography from "@/lib/Typography";
import DonateDetailsModal from "@/shared/components/DonateDetailsModal";
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

/* ------------------------------------------------------------------ */
/* Portrait asset + backdrop                                           */
/* ------------------------------------------------------------------ */

const PORTRAIT_SRC = "/overlayimg.svg";
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

  // Default to the FIRST preset amount for the current currency.
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    currencyMeta.presets[0] ?? null,
  );
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
    const meta = getDonationCurrency(next.currency);
    setCountryCode(next.code);
    setShowCustomInput(false);
    setCustomAmount("");
    setSelectedPreset(meta.presets[0] ?? null);
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
  };

  return (
    <>
     
      <div
        className="fixed inset-0 z-50 h-[100dvh] overflow-hidden overflow-clip overscroll-none bg-white/10 backdrop-blur-sm p-2 lg:p-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
      >
        <div className="flex h-full items-center justify-center lg:hidden">
          <ModalBelow1024 {...amountProps} onClose={onClose} />
        </div>
        <div className="hidden lg:flex lg:h-full lg:items-center lg:justify-center">
          <Modal1024Up {...amountProps} onClose={onClose} />
        </div>
      </div>

      {detailsOpen ? (
        <DonateDetailsModal
          amount={donationAmount}
          currency={currency}
          countryCode={countryCode}
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
      <Typography variant="caption-1" as="span" className="leading-none text-[#FCCC2D]">
        ✕
      </Typography>
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
        className={`font-serif leading-tight text-black ${align}`}
      >
        <span className="font-medium font-tiempos-fine tracking-wide">Bring Hope</span>{" "}
        <span className="bg-[#F9BF16] bg-clip-text text-transparent font-medium font-tiempos-fine tracking-wide">
          Beyond Cancer
        </span>
      </Typography>
      <Typography
        variant="body-9"
        as="p"
        className={`mt-1 max-w-2xl leading-snug text-[#302F2F]/90 font-argestadisplay font-normal ${descAlign}`}
      >
        Your contribution helps provide life-saving treatment, emotional
        care, and financial support to cancer patients and their families
        in need.
      </Typography>
    </div>
  );
}

function ImpactItems({
  className,
  centerOnMobile = false,
}: {
  className: string;
  centerOnMobile?: boolean;
}) {
 
  const rowClasses = centerOnMobile
    ? "flex min-w-0 items-start gap-2.5 text-left"
    : "flex min-w-0 items-start gap-2.5";
  return (
    <div className={className}>
      {IMPACT_ITEMS.map((item) => (
        <div key={item.title} className={rowClasses}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9BF16]/10">
            <Typography variant="body-7" as="span">
              {item.emoji}
            </Typography>
          </span>
          <div className="min-w-0">
            <Typography variant="body-7" as="p" className="!text-left font-bold font-manrope text-[#1C1C1C]">
              {item.title}
            </Typography>
            <Typography variant="body-6" as="p" className="!text-left leading-snug text-[#9D9590] font-manrope font-normal lg:whitespace-nowrap">
              {item.desc}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}


const pillBase =
  "rounded-xl border font-semibold transition";
const pillActive = "border-gray-900 bg-gray-900 text-white";
const pillInactive =
  "border-gray-200 bg-white text-[#1C1C1C] hover:border-gray-400";

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
        className="font-semibold font-manrope uppercase tracking-widest text-[#6B6660]"
      >
        Choose an amount
      </Typography>

      <div className={gridClassName}>
        {currencyMeta.presets.map((amount) => (
          <button
            key={`${currency}-${amount}`}
            onClick={() => onSelectPreset(amount)}
            className={`${pillWidthClassName} ${pillBase} ${amount === selectedPreset ? pillActive : pillInactive
              }`}
          >
            <Typography variant="body-8" as="span" className="font-semibold font-manrope">
              {formatDonationAmount(amount, currency)}
            </Typography>
          </button>
        ))}

        {showCustomInput ? (
          <div
            className={`${inputSpanClassName} flex items-center justify-center gap-1 rounded-xl border border-[#D4CEC5] bg-white px-3 py-2`}
          >
            <Typography variant="body-8" as="span" className="font-semibold font-manrope text-gray-700">
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
              className="w-14 min-w-0 font-semibold font-manrope text-[#1C1C1C] outline-none placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        ) : (
          <button
            onClick={onMoreClick}
            className={`${pillWidthClassName} ${pillBase} ${isCustom ? pillActive : pillInactive
              }`}
          >
            <Typography variant="body-8" as="span" className="font-semibold font-manrope">
              {isCustom && customAmount
                ? formatDonationAmount(Number(customAmount), currency)
                : "More"}
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
      <Typography variant="button-6" as="span" className="font-bold font-manrope text-gray-900">
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
}: Pick<AmountProps, "countryCode" | "changeCountry" | "currencyMeta"> & {
  className?: string;
}) {
  return (
    <div className={className}>
      <Typography
        variant="body-8"
        as="span"
        className="font-medium text-black font-manrope"
      >
        Country
      </Typography>
      <CountrySelect
        value={countryCode}
        onChange={changeCountry}
        variant="name"
        borderClassName="border-black"
        chevronClassName="text-black"
        textClassName="text-black"
      />
      <Typography
        variant="caption-1"
        as="span"
        className="font-manrope font-light text-black/60"
      >
        Currency: {currencyMeta.label}
      </Typography>
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
    <div className="mt-2 flex flex-col gap-1.5">
      <label className="flex min-w-0 cursor-pointer items-center gap-3">
        <span className="relative flex h-4 w-4 shrink-0">
          <input
            type="checkbox"
            checked={agreedTo80G}
            aria-invalid={termsError}
            onChange={(e) => {
              setAgreedTo80G(e.target.checked);
              if (e.target.checked) setTermsError(false);
            }}
            className="peer h-4 w-4 cursor-pointer appearance-none rounded-[3px] border border-black bg-transparent transition-colors checked:bg-[#FCCC2D] checked:border-[#FCCC2D] focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/50 focus-visible:outline-none"
          />
          <Check
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-[#3A2E00] opacity-0 peer-checked:opacity-100"
          />
        </span>
        <Typography
          variant="caption-1"
          as="span"
          className="min-w-0 flex-1 font-manrope font-light leading-snug text-black/80"
        >
          I have read and agree to the applicable{" "}
          <span className="font-semibold text-[#FCCC2D]">
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
          className="pl-7 font-manrope font-light leading-snug text-[#FFE08A]"
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
    <div className="relative mx-auto max-h-full w-full max-w-[820px] overflow-hidden overflow-clip overscroll-none rounded-xl bg-white shadow-2xl xl:max-w-[860px] 2xl:max-w-[900px]">
      <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-[60] flex h-8 w-8 items-center justify-center bg-black text-[#F9BF16] transition hover:bg-gray-800"
      />

      {/* Heading spans the full width of the card, above the image + content row */}
      <div className="relative z-30 flex w-full flex-col px-6 pt-4 2xl:px-8 2xl:pt-5 [@media(max-height:760px)]:!pt-2">
        <Heading className="w-full" />
        <div className="mt-2 [@media(max-height:760px)]:!mt-1 flex items-stretch lg:gap-5 xl:gap-6 2xl:gap-7">
          <div className="relative -ml-6 -mb-4 w-[54%] max-w-[400px] shrink-0 xl:max-w-[420px] 2xl:-ml-8 2xl:-mb-5 2xl:max-w-[440px]">
            <PortraitWithBackdrop
              className="h-full w-full"
              priority
              sizes="(min-width: 1536px) 440px, (min-width: 1280px) 420px, (min-width: 1024px) 400px, 0px"
            />
          </div>

          <div className="relative z-20 flex min-w-0 flex-1 flex-col justify-center pb-4 2xl:pb-5 [@media(max-height:760px)]:!pb-2">
            {/* Vertical rhythm between impact rows tightened (2.5 -> 1.5) */}
            <ImpactItems className="grid grid-cols-1 gap-y-1.5 [@media(max-height:760px)]:gap-y-1" />

            <div className="mt-3 [@media(max-height:760px)]:!mt-2">
              <CountryBlock
                countryCode={countryCode}
                changeCountry={changeCountry}
                currencyMeta={currencyMeta}
                className="flex flex-col gap-1 mb-2 w-full"
              />

              <AmountPicker
                {...amountProps}
                gridClassName="mt-2 grid grid-cols-3 gap-2"
                pillWidthClassName="w-full justify-center text-center px-2 py-1.5"
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
                className="mt-3 [@media(max-height:760px)]:!mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FDC61D] px-10 py-2.5 [@media(max-height:760px)]:!py-2 cursor-pointer"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
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
    <div className="relative mx-auto my-1 max-h-full w-[calc(100%-1rem)] max-w-[380px] overflow-y-auto overscroll-contain rounded-xl bg-white shadow-2xl sm:w-[calc(100%-2rem)] sm:max-w-[400px] sm:overflow-hidden md:max-w-[460px]">
      <CloseButton
        onClose={onClose}
        className="absolute right-2.5 top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-sm bg-black leading-none text-[#F9BF16] transition"
      />
      <Heading className="px-4 pr-9 pt-3" centerOnMobile />

      {/* No photo anywhere below 1024px; everything stacked and centered */}
      <div className="mt-1.5 flex flex-col items-center gap-1.5 px-4">
        <div className="flex min-w-0 w-full flex-1 flex-col items-center pb-0">
          {/* Impact rows + form share ONE column so left/right edges line up */}
          <div className="mx-auto w-full max-w-[300px]">
            <ImpactItems className="grid grid-cols-1 gap-y-1.5" centerOnMobile />

            <div className="mt-2.5 w-full">
            <CountryBlock
              countryCode={countryCode}
              changeCountry={changeCountry}
              currencyMeta={currencyMeta}
              className="flex flex-col gap-1 mb-2 w-full"
            />

            <AmountPicker
              {...amountProps}
              gridClassName="mt-1.5 grid grid-cols-3 gap-1"
              pillWidthClassName="w-full justify-center text-center px-1.5 py-1"
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
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FDC61D] px-6 py-2 cursor-pointer"
            />
            </div>
          </div>
        </div>
      </div>
      <div className="h-1.5" />
    </div>
  );
}