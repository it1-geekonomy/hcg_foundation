"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  donateTheme,
  donateAmountOptions,
  donateIcon,
  donateBgImage,
  donatemobileimg,
  donorAvatars,
} from "@/domains/home/constants/donate";

export default function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState<string>(
    donateAmountOptions[donateAmountOptions.length - 1]
  );
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const pickPreset = (amount: string) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const pickCustom = () => {
    setIsCustom(true);
    setSelectedAmount("");
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setIsCustom(true);
    setSelectedAmount("");
  };

  const cardContent = (
    <>
      {/* Header */}
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
            variant="hero"
            as="h3"
            className="font-tiempos-headline font-light text-white"
          >
            Donate Now
          </Typography>
        </div>

        <Typography
          variant="body-lg"
          as="p"
          className="w-full leading-snug text-white/70 px-8 sm:px-10 mb-8 lg:px-12 lg:mb-6"
        >
          Your contribution helps us provide care, support and hope to those
          who need it most.
        </Typography>
      </div>

      {/* Amount picker */}
      <div className="flex flex-col gap-3 mb-6 md:mb-0">
        <Typography
          variant="subheading"
          as="span"
          className="font-semibold text-white mb-6 md:mb-0"
        >
          Choose an Amount
        </Typography>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {donateAmountOptions.map((amount) => {
            const active = selectedAmount === amount && !isCustom;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => pickPreset(amount)}
                className={`w-[88%] mx-auto rounded border py-2.5 font-semibold transition-colors ${
                  active
                    ? "bg-[#FCCC2D] border-[#FCCC2D] text-[#3A2E00]"
                    : "bg-transparent border-white/35 text-white"
                }`}
              >
                <Typography variant="subheading" as="span" className="text-inherit">
                  {amount}
                </Typography>
              </button>
            );
          })}

          {isCustom ? (
            <div className="flex w-[88%] mx-auto items-center justify-center gap-1 rounded border border-[#FCCC2D] bg-[#FCCC2D]/15 py-2.5 px-2 backdrop-blur-sm">
              <Typography variant="subheading" as="span" className="text-white/70">
                ₹
              </Typography>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
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
              <Typography variant="body" as="span" className="text-inherit">
                More
              </Typography>
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:flex items-center gap-3 lg:mb-6">
        <span className="h-px flex-1 bg-white/15" />
        <Typography variant="body" as="span" className="text-[#909299]">
          or
        </Typography>
        <span className="h-px flex-1 bg-white/25" />
      </div>

      {/* Custom amount */}
      <div className="flex flex-col gap-2">
        <Typography
          variant="subheading"
          as="span"
          className="font-semibold text-white mb-4 lg:mb-6"
        >
          Custom Amount
        </Typography>

        <div className="flex items-center gap-2 border-b border-white/30 pb-2 mb-4 lg:mb-8">
          <Typography variant="subheading" as="span" className="text-[#909299]">
            ₹
          </Typography>
          <input
            type="text"
            inputMode="numeric"
            value={customAmount}
            onChange={handleCustomInputChange}
            className="w-full bg-transparent text-white placeholder-white/40 outline-none"
          />
        </div>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-6 sm:gap-4 md:gap-6 mb-10 md:mb-0">
        <div className="flex -space-x-2">
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
        <Typography variant="body-sm" as="span" className="text-white/70">
          126 kind donors have contributed this month. Join with them today.❤️
        </Typography>
      </div>

      {/* CTA */}
      <div className="flex justify-center mb-4 md:mb-0">
        <button
          type="button"
          className="rounded py-3 font-bold bg-[#FCCC2D] w-[300px] md:w-full"
        >
          <Typography variant="subheading" as="span">
            Donate Now
          </Typography>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-white/70" />
        <Typography variant="meta" as="span" className="text-white/70">
          Secure Payment
        </Typography>
        <Typography variant="meta" as="span" className="text-white/70">
          •
        </Typography>
        <Typography variant="meta" as="span" className="text-white/70">
          Trusted by Thousands
        </Typography>
      </div>
    </>
  );

  return (
    <section className="w-full bg-[#FFF6D8] pb-14 lg:pb-24">
      <div className="relative w-full">
        {/* Below 768px (<md): fixed top offset to reveal the image above the
            card, with equal 10px inset on the remaining sides. */}
        <div className="relative w-full overflow-hidden md:hidden">
          <Image
            src={donatemobileimg}
            alt="Two people holding hands"
            fill
            priority
            className="object-cover object-top"
          />
          <div className="relative z-10 pt-[300px] px-[10px] pb-[10px]">
            <div
              className="flex w-full flex-col gap-4 rounded border border-white/15 p-5 backdrop-blur-md"
              style={{ backgroundColor: donateTheme.glassBg }}
            >
              {cardContent}
            </div>
          </div>
        </div>

        {/* 768px and up (md, lg, xl...) */}
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
              className="flex w-[440px] flex-col gap-5 rounded border border-white/15 p-8 backdrop-blur-md lg:w-[540px] lg:gap-6 lg:p-12 xl:w-[600px] xl:p-14"
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