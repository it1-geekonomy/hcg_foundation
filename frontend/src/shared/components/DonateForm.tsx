"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import Typography from "@/lib/Typography";
import { Terms80GLink } from "@/shared/components/Terms80GDialog";
import {
  donateTheme,
  donateIcon,
  donateBgImage,
  donatemobileimg,
} from "@/domains/home/constants/donate";
import {
  type DonationOrigin,
  OUTSIDE_INDIA_COUNTRY_CODE,
  OUTSIDE_INDIA_CURRENCY,
} from "@/domains/home/constants/fcra-bank";
import {
  type DonationCurrencyCode,
  formatDonationAmount,
  getDonationCurrency,
} from "@/domains/home/constants/donation-currency";
import { donorsApi } from "@/shared/lib/donors-api";
import {
  CountUp,
  DonateCard,
  DonateCta,
  DonateItem,
  DonateMotionProvider,
  FlipText,
  RollingAmount,
  Shake,
  useSectionInView,
} from "./donateAnimation";

const loadDetailsModal = () => import("@/shared/components/DonateDetailsModal");
const DonateDetailsModal = dynamic(loadDetailsModal, { ssr: false });

const loadFcraModal = () => import("@/shared/components/FcraRemittanceModal");
const FcraRemittanceModal = dynamic(loadFcraModal, { ssr: false });

export type DonateFormProps = {
  patientStoryId?: string;
  patientStoryName?: string;
  hideBackgroundImage?: boolean;
};

export default function DonateSection({
  patientStoryId,
  patientStoryName,
  hideBackgroundImage = false,
}: DonateFormProps = {}) {
  const [origin, setOrigin] = useState<DonationOrigin>("india");
  const isIndia = origin === "india";
  const countryCode = isIndia ? "IN" : OUTSIDE_INDIA_COUNTRY_CODE;
  const currency: DonationCurrencyCode = isIndia ? "INR" : OUTSIDE_INDIA_CURRENCY;
  const currencyMeta = getDonationCurrency(currency);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    currencyMeta.presets[currencyMeta.presets.length - 1] ?? null,
  );
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [fcraOpen, setFcraOpen] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [agreedTo80G, setAgreedTo80G] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [originChanged, setOriginChanged] = useState(false);
  const [donorCount, setDonorCount] = useState<number>(126);

  const patientLocked = Boolean(patientStoryId);

  useEffect(() => {
    let cancelled = false;
    donorsApi
      .getMonthlyCount()
      .then((res) => {
        if (
          !cancelled &&
          typeof res?.data?.count === "number" &&
          res.data.count > 0
        ) {
          setDonorCount(res.data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const { ref: sectionRef, inView, live } = useSectionInView<HTMLElement>();

  useEffect(() => {
    if (inView) {
      void loadDetailsModal();
      void loadFcraModal();
    }
  }, [inView]);

  const changeOrigin = (next: DonationOrigin) => {
    const nextCurrency: DonationCurrencyCode =
      next === "india" ? "INR" : OUTSIDE_INDIA_CURRENCY;
    const meta = getDonationCurrency(nextCurrency);
    setOriginChanged(true);
    setOrigin(next);
    setIsCustom(false);
    setCustomAmount("");
    setSelectedPreset(meta.presets[meta.presets.length - 1] ?? null);
    setAmountError(null);
    setTermsError(false);
    setAgreedTo80G(false);
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

  const readyToDonate =
    donationAmount >= 1 && (isIndia ? agreedTo80G : true);

  const donationCategory = patientLocked
    ? ("Patient Specific" as const)
    : ("General Funds" as const);

  const causeLabel = patientStoryName || "General Funds";

  const openNextStep = () => {
    const amountInvalid = !donationAmount || donationAmount < 1;

    setAmountError(amountInvalid ? "Please choose or enter an amount." : null);
    setTermsError(isIndia && !agreedTo80G);

    if (amountInvalid || (isIndia && !agreedTo80G)) {
      setShakeKey((k) => k + 1);
      return;
    }

    if (isIndia) {
      setDetailsOpen(true);
    } else {
      setFcraOpen(true);
    }
  };

  const cardContent = (
    <>
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
            <FlipText text="Donate Now" />
          </Typography>
        </div>

        <Typography
          variant="body-7"
          as="p"
          className="w-full max-w-sm leading-relaxed text-white/70 font-argestadisplay font-bold"
        >
          {patientStoryName
            ? `Your support provides cancer care, emotional support, and financial aid for ${patientStoryName}.`
            : "Your support provides cancer care, emotional support, and financial aid to those in need."}
        </Typography>
      </DonateItem>

      <DonateItem index={1} className="flex flex-col gap-2">
        <Typography
          variant="body-8"
          as="span"
          className="font-medium text-white font-manrope"
        >
          Where are you donating from?
        </Typography>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "india" as const, label: "India" },
              { id: "outside" as const, label: "Outside India" },
            ] as const
          ).map((item) => {
            const active = origin === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => changeOrigin(item.id)}
                className={`min-h-[42px] rounded border px-2 py-2.5 font-manrope text-sm font-semibold transition-colors ${
                  active
                    ? "border-[#FCCC2D] bg-[#FCCC2D] text-[#3A2E00]"
                    : "border-white/35 bg-transparent text-white hover:border-white/70"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <Typography
          variant="caption-1"
          as="span"
          className="font-manrope font-light text-white/55"
        >
          {isIndia
            ? "Currency: INR · Pay securely with Razorpay"
            : "Currency: USD (display) · Contact Finance team"}
        </Typography>
      </DonateItem>

      <DonateItem index={2} className="flex flex-col gap-2">
        <Typography
          variant="body-8"
          as="span"
          className="font-medium text-white font-manrope"
        >
          Choose an Amount
        </Typography>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {currencyMeta.presets.map((amount, order) => {
            const active = selectedPreset === amount && !isCustom;
            return (
              <button
                key={`${currency}-${amount}`}
                type="button"
                onClick={() => pickPreset(amount)}
                aria-pressed={active}
                className={`relative w-full whitespace-nowrap rounded border px-1 py-2.5 font-semibold transition-colors duration-300 ${
                  active
                    ? "border-[#FCCC2D] bg-[#FCCC2D] text-[#3A2E00]"
                    : "border-white/35 bg-transparent text-white hover:border-white/70"
                }`}
              >
                <Typography
                  variant="body-8"
                  as="span"
                  className="relative text-inherit font-manrope"
                >
                  <RollingAmount
                    value={formatDonationAmount(amount, currency)}
                    symbol={currencyMeta.symbol}
                    order={order}
                    replay={originChanged}
                  />
                </Typography>
              </button>
            );
          })}

          {isCustom ? (
            <div className="col-span-2 flex min-w-0 items-center justify-center gap-0.5 overflow-hidden rounded border border-[#FCCC2D] bg-[#FCCC2D]/15 px-1 py-2.5 backdrop-blur-sm sm:col-span-1">
              {customAmount ? (
                <span className="shrink-0 font-manrope text-sm font-semibold leading-[1.31] text-white lg:text-base">
                  {currencyMeta.symbol}
                </span>
              ) : null}
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                maxLength={10}
                value={customAmount}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                placeholder="Amount"
                aria-label="Other amount"
                style={
                  customAmount
                    ? { width: `${customAmount.length + 0.5}ch` }
                    : undefined
                }
                className={`min-w-0 max-w-full bg-transparent font-manrope text-sm font-semibold leading-[1.31] text-white outline-none placeholder:font-normal placeholder:text-white/70 lg:text-base ${
                  customAmount ? "text-left" : "w-full text-center"
                }`}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={pickCustom}
              aria-label="Enter another amount"
              className="col-span-2 w-full rounded border border-[#FCCC2D] bg-[#FCCC2D]/15 px-1 py-2.5 text-white font-semibold backdrop-blur-sm transition-colors hover:bg-[#FCCC2D]/25 sm:col-span-1"
            >
              <Typography variant="body-8" as="span" className="font-manrope">
                Other
              </Typography>
            </button>
          )}
        </div>
      </DonateItem>

      {isIndia ? (
        <DonateItem index={3} className="flex flex-col gap-1.5">
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
              <Terms80GLink
                className="font-semibold text-[#FCCC2D]"
                onAgree={() => {
                  setAgreedTo80G(true);
                  setTermsError(false);
                }}
              />{" "}
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
      ) : (
        <DonateItem index={3} className="flex flex-col gap-1.5">
          <Typography
            variant="caption-1"
            as="p"
            className="font-manrope font-light leading-snug text-white/75"
          >
            International donations cannot be completed online through our
            payment gateway. Continue to email the Finance team — they will
            share the process for foreign donations.
          </Typography>
        </DonateItem>
      )}

      <DonateItem index={4} className="flex min-w-0 items-center gap-3">
        <Typography
          variant="body-8"
          as="p"
          className="min-w-0 flex-1 font-manrope font-light leading-snug text-white/90"
        >
          <CountUp to={donorCount} /> kind donors have contributed this month.
          Join them today. ❤️
        </Typography>
      </DonateItem>

      <DonateItem index={5} className="flex flex-col items-stretch gap-2">
        {amountError ? (
          <Shake key={`amount-${shakeKey}`}>
            <Typography
              variant="caption-1"
              as="p"
              role="alert"
              className="text-center font-manrope text-[#FFE08A]"
            >
              {amountError}
            </Typography>
          </Shake>
        ) : null}
        <DonateCta
          type="button"
          ready={readyToDonate}
          onClick={openNextStep}
          className="w-full cursor-pointer rounded bg-[#FCCC2D] py-3 font-bold font-manrope"
        >
          <Typography variant="button-1" as="span">
            {isIndia ? "Donate Now" : "Continue"}
          </Typography>
        </DonateCta>
      </DonateItem>

      <DonateItem
        index={6}
        className="flex items-center justify-center gap-1.5"
      >
        <Lock className="h-4 w-4 text-white/70" />
        <Typography
          variant="caption-1"
          as="span"
          className="text-white/60 font-light font-manrope"
        >
          {isIndia
            ? "Secured by Razorpay"
            : "Foreign donations via Finance team email"}
        </Typography>
      </DonateItem>
    </>
  );

  return (
    <section ref={sectionRef} className="w-full bg-[#FFF6D8]">
      <DonateMotionProvider inView={inView} live={live}>
        {detailsOpen ? (
          <DonateDetailsModal
            amount={donationAmount}
            currency={currency}
            countryCode={countryCode}
            donationCategory={donationCategory}
            donorCount={donorCount}
            patientStoryId={patientStoryId}
            patientStoryName={patientStoryName}
            onClose={() => setDetailsOpen(false)}
            onAmountChange={(next) => {
              setIsCustom(true);
              setCustomAmount(String(next));
              setSelectedPreset(null);
            }}
          />
        ) : null}

        {fcraOpen ? (
          <FcraRemittanceModal
            amount={donationAmount}
            currency={currency}
            causeLabel={causeLabel}
            onClose={() => setFcraOpen(false)}
            onDonateFromIndia={() => {
              setFcraOpen(false);
              changeOrigin("india");
            }}
          />
        ) : null}

        <div className="relative w-full">
          {hideBackgroundImage ? (
            <div className="relative z-10 flex justify-center px-3 py-1.5 sm:px-6 sm:py-8 lg:py-12">
              <DonateCard
                origin="top"
                glassColor="#3A3A3AEE"
                className="mx-auto flex w-full max-w-lg flex-col gap-3.5 sm:gap-5 overflow-hidden rounded p-3.5 sm:p-8 lg:w-[560px] lg:p-10 shadow-xl"
              >
                {cardContent}
              </DonateCard>
            </div>
          ) : (
            <>
              <div className="relative w-full overflow-hidden md:hidden">
                <Image
                  src={donatemobileimg}
                  alt="Two people holding hands"
                  fill
                  sizes="100vw"
                  className="object-cover object-top"
                />
                <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-12">
                  <DonateCard
                    origin="top"
                    glassColor={donateTheme.glassBg}
                    className="mx-auto flex w-full max-w-lg flex-col gap-5 overflow-hidden rounded p-5 sm:p-8"
                  >
                    {cardContent}
                  </DonateCard>
                </div>
              </div>

              <div className="relative hidden w-full overflow-hidden md:block">
                <Image
                  src={donateBgImage}
                  alt="Two people holding hands"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="relative z-10 flex justify-end px-8 py-10 lg:px-16 lg:py-12 xl:px-28 xl:py-14">
                  <DonateCard
                    origin="left"
                    glassColor={donateTheme.glassBg}
                    className="flex w-[460px] flex-col gap-5 overflow-hidden rounded p-8 lg:w-[520px] lg:p-10 xl:w-[560px] xl:gap-6"
                  >
                    {cardContent}
                  </DonateCard>
                </div>
              </div>
            </>
          )}
        </div>
      </DonateMotionProvider>
    </section>
  );
}
