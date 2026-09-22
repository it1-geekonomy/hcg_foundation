"use client";

import { useState, useEffect } from "react";

import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";
import { IntroSequence, OverlayForm } from "@/domains/home/components";

export default function HomePage() {
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const [ready, setReady] = useState(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hash;
      const cameFromDetails = sessionStorage.getItem("came_from_details");
      return !!cameFromDetails || h.includes("projects") || h.includes("events") || h.includes("smilestories");
    }
    return false;
  });

  const [showDonationOverlay, setShowDonationOverlay] = useState(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hash;
      return !ready && !h; 
    }
    return false;
  });

  useEffect(() => {
    const cameFromDetails = sessionStorage.getItem("came_from_details");
    if (cameFromDetails) {
      setReady(true);
      setShowDonationOverlay(false);
      setScrollTarget(cameFromDetails); // captures 'projects' or 'events'
      sessionStorage.removeItem("came_from_details");
    }
  }, []);

  useEffect(() => {
    if (ready && typeof window !== "undefined") {
      const rawHash = window.location.hash;
      // If there's a hash, use it. Otherwise, if we came from details, use the saved target string
      const cleanId = rawHash ? rawHash.split('#').filter(Boolean)[0] : scrollTarget;
      
      if (cleanId) {
        let attempts = 0;
        const interval = setInterval(() => {
          const el = document.getElementById(cleanId);
          if (el || attempts > 20) { // Try for 2 seconds
            clearInterval(interval);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              // Remove hash from URL so a subsequent hard refresh plays the intro normally
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }
          }
          attempts++;
        }, 100);
      }
    }
  }, [ready, scrollTarget]);

  return (
    <>
      {!ready && (
        <IntroSequence
          onDone={() => {
            setReady(true);
          }}
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