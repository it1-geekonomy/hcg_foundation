import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import DonateForm from "@/shared/components/DonateForm";

export const metadata: Metadata = pageMetadata("/donate");

export default function DonatePage() {
  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-[#FFF6D8] pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-28 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg lg:max-w-xl">
        <DonateForm hideBackgroundImage={true} />
      </div>
    </div>
  );
}
