"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import EventsListSection from "@/domains/resources/components/EventsListSection";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage=""
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
