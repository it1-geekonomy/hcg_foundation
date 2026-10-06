"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import EventsListSection from "@/domains/resources/components/EventsListSection";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791296290041-5pkq1-rectangle-186.webp"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
        title="Events"
      />

      <EventsListSection />

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
