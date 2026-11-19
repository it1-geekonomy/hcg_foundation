import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import DonateForm from "@/shared/components/DonateForm";

export const metadata: Metadata = pageMetadata("/donate");

export default function DonatePage() {
  return (
    <main className="w-full bg-[#FFF6D8] pt-2 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
      <div id="donate-form">
        <DonateForm hideBackgroundImage={true} />
      </div>
    </main>
  );
}
