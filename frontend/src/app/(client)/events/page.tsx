"use client";

import React, { useState, useEffect } from "react";
import DonateForm from "@/shared/components/DonateForm";
import EventsListSection from "@/domains/resources/components/EventsListSection";
import Banner from "@/domains/resources/events/components/bannersection";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner />
      <EventsListSection />

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
