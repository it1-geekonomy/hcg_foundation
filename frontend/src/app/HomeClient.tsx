"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const IntroSequence = dynamic(
  () =>
    import("@/domains/home/components/IntroSequence").then((m) => m.IntroSequence),
  { ssr: false }
);
const OverlayForm = dynamic(
  () => import("@/domains/home/components/OverlayForm"),
  { ssr: false }
);

export default function HomeClient({ children }: { children: React.ReactNode }) {
  // Start with ready=false and showDonationOverlay=true so the landing video/intro and donation form
  // appear on initial load / hard reload.
  const [ready, setReady] = useState(false);
  const [showDonationOverlay, setShowDonationOverlay] = useState(true);

  useEffect(() => {
    const handleNavAction = () => {
      const action = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");
      const h = window.location.hash;

      // Clear flags
      sessionStorage.removeItem("nav_action");
      sessionStorage.removeItem("came_from_details");

      if (action) {
        if (action === "logo") {
          setReady(false);
          setShowDonationOverlay(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (action === "navbar_home" || action === "banner_home_top") {
          setReady(true);
          setShowDonationOverlay(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (action === "banner_home_section") {
          setReady(true);
          setShowDonationOverlay(false);
          setTimeout(() => {
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      } else if (cameFromDetails) {
        setReady(true);
        setShowDonationOverlay(false);
        const targetId = cameFromDetails;
        let attempts = 0;
        const maxAttempts = 50; // Poll up to 2.5s for CMS-driven content to mount

        const scrollToTarget = () => {
          const el = document.getElementById(targetId);
          if (el) {
            const isSmallScreen = window.innerHeight < 900;
            el.scrollIntoView({
              behavior: attempts <= 2 ? "smooth" : "auto",
              block: isSmallScreen ? "center" : "start",
            });

            // Handle potential late layout shifts (e.g. from async CMS sections above)
            if (attempts < 6) {
              setTimeout(() => {
                const refreshedEl = document.getElementById(targetId);
                if (refreshedEl) {
                  const rect = refreshedEl.getBoundingClientRect();
                  if (rect.top < -80 || rect.top > window.innerHeight - 100) {
                    refreshedEl.scrollIntoView({
                      behavior: "smooth",
                      block: isSmallScreen ? "center" : "start",
                    });
                  }
                }
              }, 400);
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(scrollToTarget, 50);
          }
        };

        requestAnimationFrame(() => {
          setTimeout(scrollToTarget, 50);
        });
      } else if (h && (h.includes("projects") || h.includes("events") || h.includes("smilestories"))) {
        setReady(true);
        setShowDonationOverlay(false);
      }
    };

    window.addEventListener("nav_action_event", handleNavAction);
    handleNavAction();

    return () => window.removeEventListener("nav_action_event", handleNavAction);
  }, []);

  return (
    <>
      {children}

      <Suspense fallback={null}>
        {showDonationOverlay && (
          <OverlayForm
            key="donation-overlay"
            onClose={() => setShowDonationOverlay(false)}
          />
        )}

        {!ready && (
          <IntroSequence
            onDone={() => {
              setReady(true);
            }}
          />
        )}
      </Suspense>
    </>
  );
}