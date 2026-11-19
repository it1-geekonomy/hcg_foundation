import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import DonateForm from "@/shared/components/DonateForm";

export const metadata: Metadata = pageMetadata("/donate");

export default function DonatePage() {
  return (
    <div className="w-full min-h-screen bg-[#FFF6D8] pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 flex items-center justify-center">
      <div className="w-full max-w-lg lg:max-w-xl">
        <DonateForm hideBackgroundImage={true} />
      </div>
    </div>
  );
}
