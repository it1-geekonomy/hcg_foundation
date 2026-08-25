"use client";

import { useState } from "react";

import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";
import { IntroSequence, OverlayForm } from "@/domains/home/components";

export default function HomePage() {
  const [ready, setReady] =
    useState(false);

  const [showDonationOverlay, setShowDonationOverlay] =
    useState(true);

  return (
    <>
      {!ready && (
        <IntroSequence
          onDone={() =>
            setReady(true)
          }
        />
      )}

      {ready && (
        <>
          <ClientLayout>
            <ClientPage />
          </ClientLayout>

          {showDonationOverlay && (
            <OverlayForm
              onClose={() => setShowDonationOverlay(false)}
            />
          )}
        </>
      )}
    </>
  );
}