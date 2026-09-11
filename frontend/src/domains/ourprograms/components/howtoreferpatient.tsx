import Image from "next/image";
import Typography from "@/lib/Typography"; 
import {
  referralSteps,
  type ReferralStep,
} from "@/domains/ourprograms/constants/howtoreferpatient";

 
function StepCard({ step }: { step: ReferralStep }) {
  return (
    <div
      className="group relative h-full rounded-xl border border-[#FFECB3] bg-[#FFFAEC] p-4 transition-colors duration-300 ease-out hover:border-[#FCCC2D] hover:bg-[#FFE39D] sm:p-5"
    >
      {/* Number */}
      <span className="absolute left-3 top-0 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-md bg-[#FCCC2D] px-1.5 py-4 leading-none text-black sm:left-4 sm:h-6 sm:min-w-6">
        <Typography
          variant="body-9"
          as="span"
          className="font-manrope font-bold"
        >
          {step.id}
        </Typography>
      </span>

      {/* Icon + Text */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Vertical icon container — enlarged, outlined style; fills solid + icon turns white on hover */}
        <div className="flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-xl border-2 border-[#FCCC2D] bg-transparent transition-colors duration-300 group-hover:bg-yellow-500 sm:h-20 sm:w-16">
          <Image
            src={step.icon}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 object-contain transition duration-300 group-hover:brightness-0 group-hover:invert sm:h-9 sm:w-9"
          />
        </div>
 
        {/* Heading + Description */}
        <div className="min-w-0 flex-1">
          <Typography
            variant="body-3"
            as="h3"
            className="font-tiempos-fine text-black font-light whitespace-nowrap"
          >
            {step.title}
          </Typography>
 
          <Typography
            variant="body-7"
            as="p"
            className="mt-1 font-argestadisplay font-light text-[#596D79]"
          >
            {step.description}
          </Typography>
        </div>
      </div>
    </div>
  );
}
 
function StepArrow({
  visible,
}: {
  visible: {
    mobile: boolean;
    desktop: boolean;
  };
}) {
  if (!visible.mobile && !visible.desktop) return null;
 
  return (
    <div
      className={`items-center justify-center py-2 lg:py-0 ${
        visible.mobile ? "flex" : "hidden"
      } ${visible.desktop ? "lg:flex" : "lg:hidden"}`}
    >
      <Image
        src="/financialbanner/arrows.png"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 rotate-90 object-contain lg:rotate-0"
      />
    </div>
  );
}
 
export interface HowToReferProps {
  className?: string;
}
 
export default function HowToRefer({
  className = "",
}: HowToReferProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 py-10 sm:px-20 md:px-6 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      <Typography
        variant="heading-3"
        as="h2"
        className="text-center font-tiempos-headline text-[#382E07]"
      >
        How to Refer a Patient to HCG Foundation
      </Typography>
 
      <Typography
        variant="body-6"
        as="p"
        className="mx-auto mt-3 max-w-xl text-center font-manrope font-normal text-[#6B6660]"
      >
       A clear, compassionate 9-step process ensures every eligible patient receives the support they need — quickly and with dignity.
      </Typography>
 
      {/* =====================================================
          MOBILE — BELOW 768px
          1 COLUMN + VERTICAL ARROWS
      ===================================================== */}
      <div className="mt-10 flex flex-col gap-4 md:hidden">
        {referralSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col">
            <StepCard step={step} />
 
            {index !== referralSteps.length - 1 && (
              <StepArrow
                visible={{
                  mobile: true,
                  desktop: false,
                }}
              />
            )}
          </div>
        ))}
      </div>
 
      {/* =====================================================
          TABLET — md (768px) up to lg
          2 COLUMNS + HORIZONTAL ARROWS IN THE MIDDLE
      ===================================================== */}
      <div className="mt-10 hidden flex-col gap-6 md:flex lg:hidden">
        {Array.from({
          length: Math.ceil(referralSteps.length / 2),
        }).map((_, rowIndex) => {
          const firstIndex = rowIndex * 2;
          const firstStep = referralSteps[firstIndex];
          const secondStep = referralSteps[firstIndex + 1];
 
          return (
            <div
              key={firstStep.id}
              className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4"
            >
              {/* First Card */}
              <StepCard step={firstStep} />
 
              {/* Middle Arrow */}
              {secondStep ? (
                <div className="flex items-center justify-center">
                  <Image
                    src="/financialbanner/arrows.png"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                </div>
              ) : (
                <div />
              )}
 
              {/* Second Card */}
              {secondStep && <StepCard step={secondStep} />}
            </div>
          );
        })}
      </div>
 
      {/* =====================================================
          DESKTOP — lg+
          3 COLUMNS + HORIZONTAL ARROWS
      ===================================================== */}
      <div className="mt-16 hidden flex-col gap-22 lg:flex">
        {[0, 3, 6].map((rowStart) => (
          <div
            key={rowStart}
            className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4"
          >
            {referralSteps
              .slice(rowStart, rowStart + 3)
              .map((step, i) => {
                const isLastInRow = i === 2;
 
                return (
                  <div key={step.id} className="contents">
                    <StepCard step={step} />
 
                    {!isLastInRow && (
                      <StepArrow
                        visible={{
                          mobile: false,
                          desktop: true,
                        }}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}
 