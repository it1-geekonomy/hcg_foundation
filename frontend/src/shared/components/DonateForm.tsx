"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { Check, Lock } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateDetailsModal from "@/shared/components/DonateDetailsModal";
import CountrySelect from "@/shared/components/CountrySelect";
import {
  donateTheme,
  donateIcon,
  donateBgImage,
  donatemobileimg,
  donorAvatars,
} from "@/domains/home/constants/donate";
import {
  DEFAULT_COUNTRY_CODE,
  getDonationCountry,
} from "@/domains/home/constants/countries";
import {
  type DonationCurrencyCode,
  formatDonationAmount,
  getDonationCurrency,
} from "@/domains/home/constants/donation-currency";
import {
  AvatarPop,
  CountUp,
  DonateBg,
  DonateCard,
  DonateItem,
  DonateMotionProvider,
  DrawLine,
  HeartBeat,
  IconBeat,
  MaskWord,
  Shake,
  useSectionInView,
} from "./donateAnimation";

export default function DonateSection() {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const country = getDonationCountry(countryCode);
  const currency: DonationCurrencyCode = country.currency;
  const currencyMeta = getDonationCurrency(currency);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    currencyMeta.presets[currencyMeta.presets.length - 1] ?? null,
  );
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [agreedTo80G, setAgreedTo80G] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const { ref: sectionRef, inView } = useSectionInView<HTMLElement>();

  const changeCountry = (nextCode: string) => {
    const next = getDonationCountry(nextCode);
    const meta = getDonationCurrency(next.currency);
    setCountryCode(next.code);
    setIsCustom(false);
    setCustomAmount("");
    setSelectedPreset(meta.presets[meta.presets.length - 1] ?? null);
    setAmountError(null);
  };

  const pickPreset = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setCustomAmount("");
    setAmountError(null);
  };

  const pickCustom = () => {
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const handleCustomInputChange = (value: string) => {
    setCustomAmount(value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"));
    setIsCustom(true);
    setSelectedPreset(null);
    setAmountError(null);
  };

  const donationAmount = (() => {
    if (isCustom || selectedPreset == null) {
      return Number(customAmount);
    }
    return selectedPreset;
  })();

  const openDetailsForm = () => {
    const amountInvalid = !donationAmount || donationAmount < 1;

    setAmountError(amountInvalid ? "Please choose or enter an amount." : null);
    setTermsError(!agreedTo80G);

    if (amountInvalid || !agreedTo80G) {
      setShakeKey((k) => k + 1);
      return;
    }

    setDetailsOpen(true);
  };

  const cardContent = (
    <>
      {/* Header */}
      <DonateItem
        index={0}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="flex items-center gap-2">
          <Image
            src={donateIcon}
            alt=""
            width={26}
            height={26}
            className="h-[clamp(2rem,5vw,2.5rem)] w-[clamp(2rem,5vw,2.5rem)]"
          />
          <Typography
            variant="heading-6"
            as="h3"
            className="font-tiempos-fine font-normal text-white"
          >
            <MaskWord index={0}>Donate</MaskWord>{" "}
            <MaskWord index={1}>Now</MaskWord>
          </Typography>
        </div>

        <Typography
          variant="body-7"
          as="p"
          className="w-full leading-relaxed text-white/70 px-8 sm:px-10 mb-8 lg:px-12 lg:mb-6 font-argestadisplay font-bold"
        >
          Your contribution helps us provide care, support and hope to those
          who need it most.
        </Typography>
      </DonateItem>

      {/* Country */}
      <DonateItem index={1} className="flex flex-col gap-2 mb-4">
        <Typography
          variant="body-8"
          as="span"
          className="font-medium text-white font-manrope"
        >
          Country
        </Typography>
        <CountrySelect
          value={countryCode}
          onChange={changeCountry}
          variant="name"
        />
        <Typography
          variant="caption-1"
          as="span"
          className="font-manrope font-light text-white/55"
        >
          Currency: {currencyMeta.label}
        </Typography>
      </DonateItem>

      {/* Amounts (buttons themselves are not animated) */}
      <DonateItem index={2} className="flex flex-col gap-3 mb-6 md:mb-0">
        <Typography
          variant="body-7"
          as="span"
          className="font-medium text-white mb-6 md:mb-0 font-manrope"
        >
          Choose an Amount
        </Typography>

        <div className="flex flex-wrap gap-2 sm:grid sm:grid-flow-col sm:auto-cols-fr sm:gap-2 md:grid-flow-row md:auto-cols-auto md:grid-cols-4">
          {currencyMeta.presets.map((amount) => {
            const active = selectedPreset === amount && !isCustom;
            return (
              <button
                key={`${currency}-${amount}`}
                type="button"
                onClick={() => pickPreset(amount)}
                className={`rounded border px-4 py-1.5 font-semibold transition-colors sm:w-[80%] sm:mx-auto sm:px-0 sm:py-2.5 md:w-[88%] ${
                  active
                    ? "bg-[#FCCC2D] border-[#FCCC2D] text-[#3A2E00]"
                    : "bg-transparent border-white/35 text-white"
                }`}
              >
                <Typography
                  variant="body-8"
                  as="span"
                  className="text-inherit font-manrope"
                >
                  {formatDonationAmount(amount, currency)}
                </Typography>
              </button>
            );
          })}

          {isCustom ? (
            <div className="flex items-center justify-center gap-1 rounded border border-[#FCCC2D] bg-[#FCCC2D]/15 px-3 py-1.5 backdrop-blur-sm sm:w-[80%] sm:mx-auto sm:px-1 sm:py-2.5 md:w-[88%] md:px-2">
              <Typography
                variant="body-8"
                as="span"
                className="text-[#FFFFFF] font-manrope"
              >
                {currencyMeta.symbol}
              </Typography>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={customAmount}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                placeholder="0"
                className="w-16 min-w-0 bg-transparent font-semibold text-white placeholder-white/40 outline-none sm:w-full"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={pickCustom}
              className="rounded border-1 border-[#FCCC2D] bg-[#FCCC2D]/15 px-4 py-1.5 text-white font-semibold backdrop-blur-sm transition-colors sm:w-[80%] sm:mx-auto sm:px-0 sm:py-2.5 md:w-[88%]"
            >
              <Typography variant="body-8" as="span" className="font-manrope">
                More
              </Typography>
            </button>
          )}
        </div>
      </DonateItem>

      {/* "or" divider */}
      <DonateItem
        index={3}
        className="hidden md:flex items-center gap-3 lg:mb-4"
      >
        <DrawLine side="left" />
        <Typography
          variant="body-6"
          as="span"
          className="text-[#909299] font-manrope"
        >
          or
        </Typography>
        <DrawLine side="right" />
      </DonateItem>

      {/* Custom amount */}
      <DonateItem index={4} className="flex flex-col gap-2">
        <Typography
          variant="body-8"
          as="span"
          className="font-light text-white mb-4 lg:mb-6 font-manrope"
        >
          Custom Amount
        </Typography>

        <div className="flex items-center gap-2 border-b border-white/30 pb-2 mb-4 lg:mb-8">
          <Typography
            variant="body-2"
            as="span"
            className="text-[#FFFFFF] font-manrope"
          >
            {currencyMeta.symbol}
          </Typography>
          <input
            type="text"
            inputMode="decimal"
            value={customAmount}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/40 outline-none"
          />
        </div>
      </DonateItem>

      {/* 80G terms */}
      <DonateItem index={5} className="flex flex-col gap-1.5">
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
              className="peer h-4 w-4 cursor-pointer appearance-none rounded-[3px] border border-[#FCCC2D] bg-transparent transition-colors checked:bg-[#FCCC2D] focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/50 focus-visible:outline-none"
            />
            <Check
              strokeWidth={3}
              className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-[#3A2E00] opacity-0 peer-checked:opacity-100"
            />
          </span>
          <Typography
            variant="caption-1"
            as="span"
            className="min-w-0 flex-1 font-manrope font-light leading-snug text-white/80"
          >
            I have read and agree to the applicable{" "}
            <span className="font-semibold text-[#FCCC2D]">
              80G Terms &amp; Conditions
            </span>{" "}
            for this donation.
          </Typography>
        </label>

        {termsError ? (
          <Shake key={`terms-${shakeKey}`}>
            <Typography
              variant="caption-1"
              as="p"
              role="alert"
              className="pl-7 font-manrope font-light leading-snug text-[#FFE08A]"
            >
              Please agree to the 80G Terms &amp; Conditions to continue.
            </Typography>
          </Shake>
        ) : null}
      </DonateItem>

      {/* Social proof */}
      <DonateItem
        index={6}
        className="mb-2 flex min-w-0 items-start gap-3 md:mb-0"
      >
        <div className="flex shrink-0 -space-x-2 pt-0.5">
          {donorAvatars.map((src, i) => (
            <AvatarPop
              key={src}
              index={i}
              zIndex={donorAvatars.length - i}
            >
              <Image
                src={src}
                alt=""
                width={24}
                height={24}
                className="h-[clamp(1.25rem,4vw,1.5rem)] w-[clamp(1.25rem,4vw,1.5rem)] rounded-full border border-white/50"
              />
            </AvatarPop>
          ))}
        </div>
        <Typography
          variant="body-8"
          as="p"
          className="min-w-0 flex-1 font-manrope font-light leading-snug text-white/90"
        >
          <CountUp to={126} /> kind donors have contributed this month. Join
          with them today.
          <HeartBeat>❤️</HeartBeat>
        </Typography>
      </DonateItem>

      {/* Donate button (its section fades in, the button itself does not animate) */}
      <DonateItem index={7} className="flex flex-col items-center mb-0">
        {amountError ? (
          <Shake key={`amount-${shakeKey}`}>
            <p className="mb-2 font-manrope text-[#FFE08A]">{amountError}</p>
          </Shake>
        ) : null}
        <button
          type="button"
          onClick={openDetailsForm}
          className="rounded py-3 font-bold bg-[#FCCC2D] w-[240px] sm:w-[300px] md:w-full font-manrope cursor-pointer"
        >
          <Typography variant="button-1" as="span">
            Donate Now
          </Typography>
        </button>
      </DonateItem>

      <DonateItem
        index={8}
        className="flex items-center justify-center gap-1.5"
      >
        <Lock className="h-4 w-4 text-white/70" />
        <Typography
          variant="caption-1"
          as="span"
          className="text-white/60 font-light font-manrope lg:hidden"
        >
          Secure Payment • Trusted by Thousands
        </Typography>
        <Typography
          variant="brand-2"
          as="span"
          className="text-white/60 font-light font-manrope hidden lg:block"
        >
          Secure Payment • Trusted by Thousands
        </Typography>
      </DonateItem>
    </>
  );

  return (
    <section ref={sectionRef} className="w-full bg-[#FFF6D8]">
      <DonateMotionProvider inView={inView}>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        {detailsOpen ? (
          <DonateDetailsModal
            amount={donationAmount}
            currency={currency}
            countryCode={countryCode}
            onClose={() => setDetailsOpen(false)}
            onAmountChange={(next) => {
              setIsCustom(true);
              setCustomAmount(String(next));
              setSelectedPreset(null);
            }}
          />
        ) : null}

        <div className="relative w-full">
          {/* Mobile */}
          <div className="relative w-full overflow-hidden md:hidden">
            <DonateBg>
              <Image
                src={donatemobileimg}
                alt="Two people holding hands"
                fill
                priority
                className="object-cover object-top"
              />
            </DonateBg>
            <div className="relative z-10 px-6 py-6 sm:px-10 sm:py-10">
              <DonateCard
                from="bottom"
                className="relative flex w-full flex-col gap-4 overflow-hidden rounded border border-white/15 p-5 backdrop-blur-md"
                style={{ backgroundColor: donateTheme.glassBg }}
              >
                {cardContent}
              </DonateCard>
            </div>
          </div>

          {/* Desktop */}
          <div className="relative hidden w-full overflow-hidden md:block">
            <DonateBg>
              <Image
                src={donateBgImage}
                alt="Two people holding hands"
                fill
                priority
                className="object-cover"
              />
            </DonateBg>
            <div className="relative z-10 flex justify-end py-6 pl-6 pr-10 md:pr-[60px] lg:py-8 lg:pl-8 lg:pr-20 xl:py-10 xl:pl-10 xl:pr-28">
              <DonateCard
                from="right"
                className="relative flex w-[440px] flex-col gap-5 overflow-hidden rounded border border-white/15 p-8 backdrop-blur-md lg:w-[540px] lg:gap-6 lg:p-12 xl:w-[600px] xl:p-10"
                style={{ backgroundColor: donateTheme.glassBg }}
              >
                {cardContent}
              </DonateCard>
            </div>
          </div>
        </div>
      </DonateMotionProvider>
    </section>
  );
}