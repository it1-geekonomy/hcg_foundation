import React from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#FFFBEA] pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="max-w-3xl">
          <Typography
            variant="heading-1"
            as="h1"
            className="text-[#0D2838]"
            style={{ textAlign: "left" }}
          >
            Events & Community Drives
          </Typography>
          <div className="mt-4">
            <Typography variant="body-10" as="p" className="text-[#596D79]">
              Stay tuned for upcoming cancer awareness drives, screening camps, and foundation fundraising events.
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
