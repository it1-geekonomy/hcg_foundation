import { Check } from "lucide-react";
import Typography from "@/lib/Typography";
import { REFERRAL_PROCESS_ITEMS } from "@/domains/ourprograms/AwarenessAndScreening/constants/referalprocess";

export default function ReferralProcess() {
  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] pt-6 pb-8 px-8 sm:px-12 md:px-16 lg:py-12 lg:px-6 xl:px-6 2xl:px-40">
      <Typography
        variant="heading-7"
        as="h2"
        className="font-tiempos-headline text-[#382E07] font-normal"
      >
        The process to refer a patient to HCG Foundation
      </Typography>

      <ul className="mt-8 space-y-5">
        {REFERRAL_PROCESS_ITEMS.map((text, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D]"
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            <Typography
              variant="body-2"
              as="p"
              className="font-normal font-argestadisplay text-[#293239]"
            >
              {text}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
}