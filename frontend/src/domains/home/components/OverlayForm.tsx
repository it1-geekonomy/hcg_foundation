"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AMOUNTS,
  IMPACT_ITEMS,
  TRUST_ITEMS,
} from "@/domains/home/constants/overlayform";

/* ------------------------------------------------------------------ */
/* Root component                                                      */
/* ------------------------------------------------------------------ */

export default function OverlayForm({ onClose }: { onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState("₹3000");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

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

  const commitCustomAmount = () => {
    const numeric = customAmount.trim().replace(/[^\d]/g, "");
    if (numeric) setSelectedAmount(`₹${numeric}`);
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

  const amountProps: AmountProps = {
    selectedAmount,
    onSelectAmount: setSelectedAmount,
    showCustomInput,
    customAmount,
    onCustomAmountChange: setCustomAmount,
    onMoreClick: () => setShowCustomInput(true),
    onCustomAmountKeyDown: handleCustomAmountKeyDown,
    onCustomAmountBlur: commitCustomAmount,
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-white/10 backdrop-blur-sm py-6 lg:py-12"
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
  );
}

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

type AmountProps = {
  selectedAmount: string;
  onSelectAmount: (amount: string) => void;
  showCustomInput: boolean;
  customAmount: string;
  onCustomAmountChange: (value: string) => void;
  onMoreClick: () => void;
  onCustomAmountKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCustomAmountBlur: () => void;
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
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        Together, we can
      </p>
      <h2
        id="donation-modal-title"
        className="mt-4 font-serif text-4xl leading-tight text-gray-900 md:text-5xl"
      >
        <span className="italic">Bring Hope</span>
        <br />
        <span className="italic bg-gradient-to-r from-[#F9BF16] to-[#B98A00] bg-clip-text text-transparent">
          Beyond Cancer
        </span>
      </h2>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-500">
        Your contribution helps provide life-saving treatment, emotional
        care, and financial support to cancer patients and their families
        in need.
      </p>
    </>
  );
}

function ImpactItems({ className }: { className: string }) {
  return (
    <div className={className}>
      {IMPACT_ITEMS.map((item) => (
        <div key={item.title} className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9BF16]/10 text-lg">
            {item.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
            <p className="text-xs leading-snug text-gray-400">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrustItems() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#EDE8E0] pt-6 sm:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="flex min-w-0 flex-col gap-1">
          <span className="text-base">{item.icon}</span>
          <p className="text-xs font-semibold text-gray-900">{item.title}</p>
          <p className="text-[11px] leading-snug text-gray-400">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

const pillBase =
  "rounded-xl border px-4 py-2 text-sm font-semibold transition";
const pillActive = "border-gray-900 bg-gray-900 text-white";
const pillInactive =
  "border-gray-200 bg-white text-gray-700 hover:border-gray-400";

function AmountPicker({
  selectedAmount,
  onSelectAmount,
  showCustomInput,
  customAmount,
  onCustomAmountChange,
  onMoreClick,
  onCustomAmountKeyDown,
  onCustomAmountBlur,
  gridClassName,
  pillWidthClassName = "",
  inputSpanClassName = "",
}: AmountProps & {
  gridClassName: string;
  pillWidthClassName?: string;
  inputSpanClassName?: string;
}) {
  const customInputRef = useRef<HTMLInputElement>(null);
  const isCustom = !AMOUNTS.includes(selectedAmount);

  useEffect(() => {
    if (showCustomInput) customInputRef.current?.focus();
  }, [showCustomInput]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        Choose an amount
      </p>

      <div className={gridClassName}>
        {AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelectAmount(amount)}
            className={`${pillWidthClassName} ${pillBase} ${
              amount === selectedAmount ? pillActive : pillInactive
            }`}
          >
            {amount}
          </button>
        ))}

        {showCustomInput ? (
          <div
            className={`${inputSpanClassName} flex items-center gap-1 rounded-xl border border-gray-900 bg-white px-3 py-2`}
          >
            <span className="text-sm font-semibold text-gray-700">₹</span>
            <input
              ref={customInputRef}
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              onKeyDown={onCustomAmountKeyDown}
              onBlur={onCustomAmountBlur}
              placeholder="Enter amount"
              className="w-full text-sm font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        ) : (
          <button
            onClick={onMoreClick}
            className={`${pillWidthClassName} ${pillBase} ${
              isCustom ? pillActive : pillInactive
            }`}
          >
            {isCustom ? selectedAmount : "More"}
          </button>
        )}
      </div>
    </div>
  );
}

function DonateButton({ className }: { className: string }) {
  const router = useRouter();
  return (
    <>
      <button onClick={() => router.push("/")} className={className}>
        ❤️ DONATE NOW →
      </button>
      <p className="mt-2 text-center text-xs text-gray-400 lg:text-center">
        🔒 Secure Payment | Powered by Razorpay
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Modal — 1024px and above                                            */
/* ------------------------------------------------------------------ */

function Modal1024Up({
  onClose,
  ...amountProps
}: AmountProps & { onClose: () => void }) {
  return (
    <div className="relative mx-auto my-4 min-h-[700px] w-[calc(100%-2rem)] max-w-[1400px] overflow-hidden bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%,_#C89100_100%)] shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:my-0 lg:h-[760px] lg:min-h-0 lg:w-auto lg:max-w-none xl:inset-24 xl:h-[780px]">
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
          sizes="(min-width: 1536px) 900px, (min-width: 1280px) 850px, (min-width: 1024px) 780px, 0px"
          className="absolute bottom-0 right-0 h-[600px] w-auto max-w-none object-contain object-bottom xl:h-[700px] 2xl:h-[750px]"
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

      <div className="relative z-30 flex min-h-[700px] w-full flex-col justify-center px-8 py-10 lg:min-h-0 lg:h-full lg:justify-start lg:px-12 lg:py-12 2xl:px-26">
        <div className="relative z-40 w-full lg:max-w-[540px]">
          <Heading />

          <ImpactItems className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" />

          <div className="mt-10">
            <AmountPicker
              {...amountProps}
              gridClassName="mt-3 flex flex-wrap items-center gap-2"
            />

            <DonateButton className="mx-auto mt-8 flex w-fit items-center justify-center gap-2 rounded-xl bg-[#FDC61D] px-10 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#E9B510] md:mx-0 lg:w-full" />
          </div>

          <TrustItems />
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
  return (
    <div className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%)] shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:mx-0 lg:my-auto lg:max-h-[860px] lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch lg:bg-[linear-gradient(115deg,_#ffffff_0%,_#ffffff_52%,_#FCE9AE_74%,_#C89100_100%)] xl:inset-16">
      <CloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center bg-black text-[#F9BF16] transition"
      />

      <div className="pointer-events-none absolute right-0 top-1/2 z-0 h-[clamp(420px,55vw,460px)] w-[60%] -translate-y-1/2 [mask-image:radial-gradient(ellipse_60%_70%_at_60%_40%,black_45%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_60%_70%_at_60%_40%,black_45%,transparent_100%)] lg:hidden">
        <Image
          src="/formimage.png"
          alt="Cancer patient and her daughter embracing, both smiling"
          fill
          sizes="60vw"
          className="object-cover object-top"
        />
      </div>

      <div className="relative flex w-full min-w-0 flex-col justify-center px-8 py-6 lg:w-1/2 lg:min-h-0 lg:justify-start lg:overflow-y-auto lg:overscroll-contain lg:bg-white lg:px-12 lg:py-8 lg:[mask-image:linear-gradient(to_right,black_0%,black_85%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,black_0%,black_85%,transparent_100%)]">
        <Heading />

        <ImpactItems className="mt-8 grid grid-cols-1 gap-4" />

        <div className="mt-10 w-full lg:w-fit">
          <AmountPicker
            {...amountProps}
            gridClassName="mt-3 grid grid-cols-[repeat(3,max-content)] gap-2"
            pillWidthClassName="w-fit"
            inputSpanClassName="col-span-3"
          />

          <DonateButton className="mt-8 flex w-fit items-center justify-center gap-2 mx-auto rounded-xl bg-[#FDC61D] px-10 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#E9B510] lg:w-full lg:self-auto lg:px-0 lg:py-3.5" />
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