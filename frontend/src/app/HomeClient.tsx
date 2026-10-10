"use client";

import { useState, useEffect } from "react";

import dynamic from "next/dynamic";

const loadIntro = () =>
  import("@/domains/home/components/IntroSequence").then((m) => m.IntroSequence);
const loadOverlay = () => import("@/domains/home/components/OverlayForm");

const IntroSequence = dynamic(loadIntro, { ssr: false });
const OverlayForm = dynamic(loadOverlay, { ssr: false });

/**
 * Runs inline, before first paint. Returning visitors (nav action, came from details, hash links)
 * and PageSpeed/webdriver never see the cover. Same rules as the `ready` initial state below.
 */
const COVER_GUARD = `try{var s=sessionStorage,h=location.hash,n=s.getItem('nav_action');
if((n&&n!=='logo')||s.getItem('came_from_details')||/projects|events|smilestories/.test(h)||navigator.webdriver){
var c=document.getElementById('intro-cover');if(c)c.style.display='none'}}catch(e){}`;

export default function HomeClient({ children, isBot }: { children: React.ReactNode; isBot?: boolean }) {
  const [ready, setReady] = useState(isBot || false);
  const [showDonationOverlay, setShowDonationOverlay] = useState(false);

  // The server HTML always contains the homepage (the intro/overlay are ssr:false and load later),
  // so on a first visit the homepage used to flash until those chunks arrived. This cover sits on
  // top from the very first paint and is removed only once the intro/overlay chunks have loaded.
  const [coverGone, setCoverGone] = useState(false);

  useEffect(() => {
    if (!isBot) {
      const h = window.location.hash;
      const navAction = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");
      const isAuto = navigator.webdriver;

      let nextReady = false;
      let nextOverlay = false;

      if (navAction === "logo") {
        nextReady = false;
        nextOverlay = true;
      } else if (navAction || cameFromDetails) {
        nextReady = true;
        nextOverlay = false;
      } else {
        const hasHash = h.includes("projects") || h.includes("events") || h.includes("smilestories");
        nextReady = isAuto || hasHash;
        nextOverlay = !isAuto && !hasHash && !h;
      }

      setReady(nextReady);
      setShowDonationOverlay(nextOverlay);
    }
    // Run exactly ONCE on mount to sync client state without structural hydration mismatch.
    // Do NOT depend on ready/showDonationOverlay, otherwise it reverts them after the intro finishes!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && !showDonationOverlay) {
      setCoverGone(true);
      return;
    }
    let cancelled = false;
    const jobs: Promise<unknown>[] = [];
    if (!ready) jobs.push(loadIntro());
    if (showDonationOverlay) jobs.push(loadOverlay());
    Promise.all(jobs)
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        // two frames so the intro has painted before the cover goes away
        requestAnimationFrame(() => requestAnimationFrame(() => setCoverGone(true)));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleNavAction = () => {
      const action = sessionStorage.getItem("nav_action");
      const cameFromDetails = sessionStorage.getItem("came_from_details");

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
                  // If layout shift pushed it off screen or misplaced it, gently re-align
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
      }
    };

    window.addEventListener("nav_action_event", handleNavAction);
    handleNavAction();

    return () => window.removeEventListener("nav_action_event", handleNavAction);
  }, []);

  return (
    <>
      {children}

      {/* Same on server and first client render, so hydration matches. Bots never get it. */}
      {!isBot && !coverGone && (
        <>
          <div
            id="intro-cover"
            aria-hidden
            suppressHydrationWarning
            // Same colour as IntroSequence's background so the handover is invisible.
            className="fixed inset-0 z-[9999] bg-[#2D2D2D]"
          />
          <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: COVER_GUARD }} />
        </>
      )}

      <div suppressHydrationWarning>
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
      </div>
    </>
  );
}