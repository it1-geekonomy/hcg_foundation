"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  IMPACT_ITEMS,
  TRUST_ITEMS,
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

  // Changing country updates currency + resets the amount selection to the
  // new currency's first preset (mirrors DonateSection's behaviour).
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
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-white/10 backdrop-blur-sm py-3 lg:py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
      >
        <div className="block lg:hidden">
          <ModalBelow1024 {...amountProps} onClose={onClose} />
        </div>
        <div className="hidden lg:block">
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
      ✕
    </button>
  );
}

function Heading() {
  return (
    <>
      <Typography
        variant="label-1"
        as="p"
        className="font-semibold font-manrope uppercase tracking-widest text-black"
      >
        Together, we can
      </Typography>
      <Typography
        variant="heading-2"
        as="h2"
        className="mt-4 font-serif leading-tight text-black"
      >
        <span className="font-medium font-tiempos-fine tracking-wide">Bring Hope</span>
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-[#F9BF16] to-[#B98A00] bg-clip-text text-transparent font-medium font-tiempos-fine tracking-wide">
          {" "}Beyond Cancer
        </span>
      </Typography>
      <Typography
        variant="body-9"
        as="p"
        className="mt-6 hidden max-w-xl leading-relaxed text-gray-500 font-argestadisplay font-normal sm:block"
      >
        Your contribution helps provide life-saving treatment, emotional
        care, and financial support to cancer patients and their families
        in need.
      </Typography>
    </>
  );
}

function ImpactItems({ className }: { className: string }) {
  return (
    <div className={className}>
      {IMPACT_ITEMS.map((item) => (
        <div key={item.title} className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9BF16]/10">
            {item.emoji}
          </span>
          <div className="min-w-0">
            <Typography variant="body-7" as="p" className="font-bold font-manrope text-gray-900">
              {item.title}
            </Typography>
            <Typography variant="body-6" as="p" className="leading-snug !text-left text-[#333131] font-manrope font-normal">
              {item.desc}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrustItems({
  className = "mt-8 grid grid-cols-2 gap-y-4 gap-x-2 border-t border-[#EDE8E0] pt-6 max-[474px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:gap-x-10",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      {TRUST_ITEMS.map((item) => (
        <div
          key={item.title}
          className="flex min-w-0 items-start gap-2 lg:flex-row lg:items-start"
        >
          <span className="shrink-0">{item.icon}</span>
          <div className="min-w-0">
            <Typography variant="brand-1" as="p" className="lg:hidden font-semibold font-manrope text-[#1C1C1C] text-nowrap">
              {item.title}
            </Typography>
            <Typography variant="brand-2" as="p" className="hidden lg:block font-semibold font-manrope text-[#1C1C1C]">
              {item.title}
            </Typography>
            <Typography variant="body-5" as="p" className="lg:hidden leading-snug font-normal font-manrope text-[#333131]">
              {item.desc}
            </Typography>
            <Typography variant="brand-2" as="p" className="hidden lg:block leading-snug font-normal font-manrope text-[#333131]">
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
  "border-gray-200 bg-white text-gray-700 hover:border-gray-400";

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
        className="font-semibold font-manrope uppercase tracking-widest text-gray-500"
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
            className={`${inputSpanClassName} flex items-center gap-1 rounded-xl border border-gray-900 bg-white px-3 py-2`}
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
              className="w-16 min-w-0 font-semibold font-manrope text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
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
}: {
  className: string;
  onDonateClick: () => void;
}) {
  return (
    <>
      <button onClick={onDonateClick} className={className}>
        <Typography variant="button-6" as="span" className="font-bold font-manrope text-gray-900">
          ❤️ DONATE NOW →
        </Typography>
      </button>
      
    </>
  );
}

function CountryBlock({
  countryCode,
  changeCountry,
  currencyMeta,
}: Pick<AmountProps, "countryCode" | "changeCountry" | "currencyMeta">) {
  return (
    <div className="flex flex-col gap-2 mb-4 w-full max-w-[280px] sm:max-w-[320px]">
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
    <div className="mt-4 flex flex-col gap-1.5">
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
    <div className="relative mx-auto my-4 min-h-[700px] w-[calc(100%-2rem)] max-w-[1400px] overflow-hidden bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%,_#C89100_100%)] shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:left-12 lg:right-12 lg:top-6 lg:my-0 lg:min-h-[760px] lg:w-auto lg:max-w-none 2xl:left-24 2xl:right-24 2xl:top-6 2xl:min-h-[780px]">
            <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-[60] flex h-8 w-8 items-center justify-center bg-black text-[#F9BF16] transition hover:bg-gray-800"
      />

      <div className="pointer-events-none absolute right-0 top-[10px] bottom-0 z-10 hidden lg:block">
        <Image
          src="/formimage.png"
          alt="Cancer patient and her daughter embracing, both smiling"
          width={1000}
          height={1000}
          priority
          sizes="(min-width: 1536px) 900px, (min-width: 1024px) 780px, 0px"
          className="absolute bottom-0 right-0 h-[750px] w-auto max-w-none object-contain object-bottom lg:scale-[0.82] lg:origin-bottom-right xl:scale-[1.05] 2xl:h-[750px]"
        />
      </div>

      <div className="pointer-events-none absolute right-0 top-[10px] bottom-0 z-10 w-[56%] lg:hidden">
        <Image
          src="/formimage.png"
          alt="Cancer patient and her daughter embracing, both smiling"
          width={1000}
          height={1000}
          priority
          sizes="62vw"
          className="absolute bottom-0 right-0 h-[76%] w-auto max-w-none object-contain object-bottom"
        />
      </div>

      <div className="relative z-30 flex min-h-[700px] w-full flex-col justify-center px-8 py-4 lg:min-h-0 lg:h-full lg:justify-start lg:px-12 lg:py-6 2xl:px-14">
        <div className="relative z-40 w-full lg:max-w-3xl">
          <Heading />

          <ImpactItems className="mt-8 grid grid-cols-2 gap-x-10 gap-y-5 lg:grid-cols-2 lg:max-w-[520px] xl:grid-cols-2 2xl:grid-cols-2 2xl:max-w-none" />

          <div className="mt-10 max-w-[520px] 2xl:max-w-[560px]">
            <CountryBlock
              countryCode={countryCode}
              changeCountry={changeCountry}
              currencyMeta={currencyMeta}
            />

            <AmountPicker
              {...amountProps}
              gridClassName="mt-3 grid grid-flow-col auto-cols-fr gap-2 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 xl:grid-cols-3 2xl:grid-flow-col 2xl:auto-cols-fr 2xl:grid-cols-none 2xl:gap-2"
              pillWidthClassName="w-full justify-center text-center px-3 py-2 lg:w-full lg:justify-center lg:text-center lg:px-3 lg:py-2 xl:w-full xl:justify-center xl:text-center xl:px-3 xl:py-2 2xl:w-full 2xl:justify-center 2xl:text-center 2xl:px-3 2xl:py-2"
              inputSpanClassName="w-full lg:w-full xl:w-full 2xl:w-full"
            />

            <TermsCheckbox
              agreedTo80G={agreedTo80G}
              setAgreedTo80G={setAgreedTo80G}
              termsError={termsError}
              setTermsError={setTermsError}
            />

            <DonateButton
              onDonateClick={onDonateClick}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#FDC61D] px-10 py-3.5 cursor-pointer md:mx-0 lg:w-[calc(100%-0.125rem)] xl:w-[calc(100%-0.125rem)] 2xl:w-[calc(100%-0.125rem)]"
            />
          </div>

          <TrustItems className="mt-8 grid grid-cols-2 gap-x-0 gap-y-4 border-t border-[#EDE8E0] pt-6 lg:grid-cols-1 lg:max-w-[460px] 2xl:grid-cols-2 2xl:gap-x-0 2xl:gap-y-4 2xl:max-w-none" />
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
        <div
      className="relative mx-auto my-2 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-[linear-gradient(115deg,_#FFEEBD_0%,_#ffffff_100%)] shadow-2xl sm:bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%)] sm:my-3 sm:w-[calc(100%-3rem)] lg:absolute lg:left-12 lg:right-12 lg:top-6 lg:mx-0 lg:my-0 lg:min-h-[860px] lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch lg:bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%,_#C89100_100%)] 2xl:left-16 2xl:right-16 2xl:top-16"
    >
      <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center bg-black text-[#F9BF16] transition"
      />

      {/* Below 640px only — image stacked on top, content flows below it */}
      <div className="relative z-0 mx-auto h-[280px] w-[320px] shrink-0 sm:hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_65%_at_50%_45%,_#FFEEBD_0%,_transparent_72%)]" />
        <Image
          src="/form640.png"
          alt="Cancer patient and her daughter embracing, both smiling"
          fill
          sizes="320px"
          className="object-cover object-top [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,black_55%,transparent_100%),linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,black_55%,transparent_100%),linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)] [-webkit-mask-composite:source-in]"
        />
      </div>

      {/* 640px–1024px — unchanged from original */}
      <div className="pointer-events-none absolute right-0 top-1/2 z-0 hidden h-[clamp(420px,55vw,460px)] w-[60%] -translate-y-1/2 [mask-image:radial-gradient(ellipse_60%_70%_at_60%_40%,black_45%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_60%_70%_at_60%_40%,black_45%,transparent_100%)] sm:block lg:hidden">
        <Image
          src="/formimage.png"
          alt="Cancer patient and her daughter embracing, both smiling"
          fill
          sizes="60vw"
          className="object-cover object-top"
        />
      </div>

      <div className="relative flex w-full min-w-0 flex-col justify-center px-8 pb-6 pt-0 sm:py-6 lg:w-1/2 lg:justify-start lg:bg-white lg:px-12 lg:py-8 lg:[mask-image:linear-gradient(to_right,black_0%,black_85%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,black_0%,black_85%,transparent_100%)]">
        <Heading />

        <ImpactItems className="mt-8 grid grid-cols-1 gap-4" />

        <div className="mt-10 w-full lg:w-fit">
          <CountryBlock
            countryCode={countryCode}
            changeCountry={changeCountry}
            currencyMeta={currencyMeta}
          />

          <AmountPicker
            {...amountProps}
            gridClassName="mt-3 flex flex-wrap gap-2"
            pillWidthClassName="w-fit px-4 py-2"
            inputSpanClassName="w-fit"
          />

          <TermsCheckbox
            agreedTo80G={agreedTo80G}
            setAgreedTo80G={setAgreedTo80G}
            termsError={termsError}
            setTermsError={setTermsError}
          />

          <DonateButton
            onDonateClick={onDonateClick}
            className="mt-8 flex w-fit items-center justify-center gap-2 mx-auto rounded-xl bg-[#FDC61D] px-10 py-3 cursor-pointer lg:w-full lg:self-auto lg:px-0 lg:py-3.5"
          />
        </div>

        <TrustItems />
      </div>

      <div className="relative -mt-px hidden w-full shrink-0 lg:mt-0 lg:block lg:h-full lg:w-1/2">
        <div className="relative h-[clamp(220px,25vw,260px)] w-full lg:aspect-auto lg:h-full">
          <Image
            src="/formimage.png"
            alt="Cancer patient and her daughter embracing, both smiling"
            fill
            sizes="(min-width: 1024px) 50vw, 50vw"
            className="object-cover object-top [mask-composite:intersect] [-webkit-mask-composite:source-in] [mask-image:linear-gradient(to_left,black_96%,transparent_100%),radial-gradient(circle_at_top_left,transparent_0%,black_22%)] [-webkit-mask-image:linear-gradient(to_left,black_96%,transparent_100%),radial-gradient(circle_at_top_left,transparent_0%,black_22%)]"
            priority
          />
        </div>
      </div>
    </div>
  );
}