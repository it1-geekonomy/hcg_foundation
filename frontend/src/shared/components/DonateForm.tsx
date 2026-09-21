"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { Lock } from "lucide-react";
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
    if (!donationAmount || donationAmount < 1) {
      setAmountError("Please choose or enter an amount.");
      return;
    }
    setAmountError(null);
    setDetailsOpen(true);
  };

  const cardContent = (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
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
            Donate Now
          </Typography>
        </div>

        <Typography
          variant="body-7"
          as="p"
          className="w-full leading-snug font-light text-white/70 px-8 sm:px-10 mb-8 lg:px-12 lg:mb-6 font-argestadisplay"
        >
          Your contribution helps us provide care, support and hope to those
          who need it most.
        </Typography>
      </div>

      <div className="flex flex-col gap-2 mb-4">
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
      </div>

      <div className="flex flex-col gap-3 mb-6 md:mb-0">
        <Typography
          variant="body-7"
          as="span"
          className="font-medium text-white mb-6 md:mb-0 font-manrope"
        >
          Choose an Amount
        </Typography>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {currencyMeta.presets.map((amount) => {
            const active = selectedPreset === amount && !isCustom;
            return (
              <button
                key={`${currency}-${amount}`}
                type="button"
                onClick={() => pickPreset(amount)}
                className={`w-[88%] mx-auto rounded border py-2.5 font-semibold transition-colors ${
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
            <div className="flex w-[88%] mx-auto items-center justify-center gap-1 rounded border border-[#FCCC2D] bg-[#FCCC2D]/15 py-2.5 px-2 backdrop-blur-sm">
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
                className="w-full min-w-0 bg-transparent font-semibold text-white placeholder-white/40 outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={pickCustom}
              className="w-[88%] mx-auto rounded border-1 border-[#FCCC2D] bg-[#FCCC2D]/15 py-2.5 text-white font-semibold backdrop-blur-sm transition-colors"
            >
              <Typography
                variant="body-8"
                as="span"
                className="text-inherit font-manrope"
              >
                More
              </Typography>
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 lg:mb-4">
        <span className="h-px flex-1 bg-white/15" />
        <Typography
          variant="body-6"
          as="span"
          className="text-[#909299] font-manrope"
        >
          or
        </Typography>
        <span className="h-px flex-1 bg-white/25" />
      </div>

      <div className="flex flex-col gap-2">
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
      </div>

      <div className="mb-10 flex min-w-0 items-start gap-3 md:mb-0">
        <div className="flex shrink-0 -space-x-2 pt-0.5">
          {donorAvatars.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={24}
              height={24}
              style={{ zIndex: donorAvatars.length - i }}
              className="h-[clamp(1.25rem,4vw,1.5rem)] w-[clamp(1.25rem,4vw,1.5rem)] rounded-full border border-white/50"
            />
          ))}
        </div>
        <Typography
          variant="body-8"
          as="p"
          className="min-w-0 flex-1 font-manrope text-[11px] font-light leading-snug text-white/90 sm:text-sm"
        >
          126 kind donors have contributed this month. Join with them today.❤️
        </Typography>
      </div>

      <div className="flex flex-col items-center mb-4 md:mb-0">
        {amountError ? (
          <p className="mb-2 font-manrope text-sm text-[#FFE08A]">
            {amountError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={openDetailsForm}
          className="rounded py-3 font-bold bg-[#FCCC2D] w-[300px] md:w-full font-manrope"
        >
          <Typography variant="button-1" as="span">
            Donate Now
          </Typography>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5">
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
      </div>
    </>
  );

  return (
    <section className="w-full bg-[#FFF6D8]">
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
        <div className="relative w-full overflow-hidden md:hidden">
          <Image
            src={donatemobileimg}
            alt="Two people holding hands"
            fill
            priority
            className="object-cover object-top"
          />
          <div className="relative z-10 px-8 py-8 sm:px-18 sm:py-18">
            <div
              className="flex w-full flex-col gap-4 rounded border border-white/15 p-5 backdrop-blur-md"
              style={{ backgroundColor: donateTheme.glassBg }}
            >
              {cardContent}
            </div>
          </div>
        </div>

        <div className="relative hidden w-full overflow-hidden md:block">
          <Image
            src={donateBgImage}
            alt="Two people holding hands"
            fill
            priority
            className="object-cover"
          />
          <div className="relative z-10 flex justify-end py-6 pl-6 pr-10 md:pr-[60px] lg:py-8 lg:pl-8 lg:pr-20 xl:py-10 xl:pl-10 xl:pr-28">
            <div
              className="flex w-[440px] flex-col gap-5 rounded border border-white/15 p-8 backdrop-blur-md lg:w-[540px] lg:gap-6 lg:p-12 xl:w-[600px] xl:p-10"
              style={{ backgroundColor: donateTheme.glassBg }}
            >
              {cardContent}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
