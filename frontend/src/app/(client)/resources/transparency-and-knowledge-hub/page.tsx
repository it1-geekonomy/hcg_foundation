"use client";

import React from "react";
import DonateForm from "@/shared/components/DonateForm";
import Typography from "@/lib/Typography";

const CONTAINER = "max-w-[75rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6";

export default function TransparencyAndKnowledgeHubPage() {
  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="max-w-3xl">
          <Typography
            variant="heading-1"
            as="h1"
            className="text-[#2E1C12]"
          >
            Transparency & Knowledge Hub
          </Typography>
          <div className="mt-4">
            <Typography
              variant="body-8"
              as="p"
              className="text-[#6C6048]"
            >
              At HCG Foundation, we believe in complete transparency, open accountability, and empowering communities through shared knowledge on cancer care, financial aid reports, and foundation impact metrics.
            </Typography>
          </div>
        </div>
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
