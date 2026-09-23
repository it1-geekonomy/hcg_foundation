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
      const navAction = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");

      if (navAction === "logo") return false;
      if (navAction) return true;
      if (cameFromDetails) return true;
      
      return h.includes("projects") || h.includes("events") || h.includes("smilestories");
    }
    return false;
  });

  const [showDonationOverlay, setShowDonationOverlay] = useState(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hash;
      const navAction = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");
      
      if (navAction === "logo") return true;
      if (navAction) return false;
      if (cameFromDetails) return false;

      const isReady = h.includes("projects") || h.includes("events") || h.includes("smilestories");
      return !isReady && !h; 
    }
    return false;
  });

  useEffect(() => {
    const handleNavAction = () => {
      const action = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");
      
      // Clear both flags to prevent them from affecting future navigations
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
        // Back button navigation fallback
        setReady(true);
        setShowDonationOverlay(false);
        setTimeout(() => {
           document.getElementById(cameFromDetails)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    };

    window.addEventListener("nav_action_event", handleNavAction);
    handleNavAction();

    return () => window.removeEventListener("nav_action_event", handleNavAction);
  }, []);

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