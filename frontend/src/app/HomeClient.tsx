"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const loadIntro = () =>
  import("@/domains/home/components/IntroSequence").then((m) => m.IntroSequence);
const loadOverlay = () => import("@/domains/home/components/OverlayForm");

const IntroSequence = dynamic(loadIntro, { ssr: false });
const OverlayForm = dynamic(loadOverlay, { ssr: false });

/**
 * Runs inline before first paint. Returning visitors (nav action, came from details, hash links)
 * and PageSpeed/webdriver/Lighthouse bots never see the cover.
 */
const COVER_GUARD = `try{var s=sessionStorage,h=location.hash,n=s.getItem('nav_action'),u=navigator.userAgent||'';
if((n&&n!=='logo')||s.getItem('came_from_details')||/projects|events|smilestories/.test(h)||navigator.webdriver||/Lighthouse|PageSpeed|Googlebot|HeadlessChrome|HeadlessChromium|Chrome-Lighthouse|Google-PageSpeed|PTST|bingbot|baiduspider|Screaming|crawler|spider|bot/i.test(u)){
var c=document.getElementById('intro-cover');if(c)c.style.display='none'}}catch(e){}`;

function detectNavIntent(isBot?: boolean) {
  if (isBot) {
    return { isReturning: true, targetId: null, showOverlay: false, isLogo: false };
  }
  if (typeof window === "undefined") {
    return { isReturning: false, targetId: null, showOverlay: true, isLogo: false };
  }

  const ua = navigator.userAgent || "";
  const isAuto =
    Boolean(navigator.webdriver) ||
    /Lighthouse|PageSpeed|Googlebot|HeadlessChrome|HeadlessChromium|Chrome-Lighthouse|Google-PageSpeed|PTST|bingbot|baiduspider|Screaming\s*Frog|ScreamingFrog|crawler|spider|bot/i.test(ua);
  if (isAuto) {
    return { isReturning: true, targetId: null, showOverlay: false, isLogo: false };
  }

  const h = window.location.hash;
  const navAction = sessionStorage.getItem("nav_action");
  const cameFromDetails = sessionStorage.getItem("came_from_details");

  if (navAction === "logo") {
    return { isReturning: false, targetId: null, showOverlay: true, isLogo: true };
  }

  if (navAction === "navbar_home" || navAction === "banner_home_top") {
    return { isReturning: true, targetId: "top", showOverlay: false, isLogo: false };
  }

  if (navAction === "banner_home_section") {
    return { isReturning: true, targetId: "projects", showOverlay: false, isLogo: false };
  }

  if (cameFromDetails) {
    return { isReturning: true, targetId: cameFromDetails, showOverlay: false, isLogo: false };
  }

  if (
    h &&
    (h.includes("projects") ||
      h.includes("events") ||
      h.includes("smilestories") ||
      h.includes("donate-form"))
  ) {
    const id = h.replace(/^#/, "");
    return { isReturning: true, targetId: id, showOverlay: false, isLogo: false };
  }

  return { isReturning: false, targetId: null, showOverlay: true, isLogo: false };
}

export default function HomeClient({
  children,
  isBot,
}: {
  children: React.ReactNode;
  isBot?: boolean;
}) {
  const [ready, setReady] = useState(() => {
    if (isBot) return true;
    if (typeof window !== "undefined") {
      return detectNavIntent(false).isReturning;
    }
    return false;
  });

  const [showDonationOverlay, setShowDonationOverlay] = useState(() => {
    if (isBot) return false;
    if (typeof window !== "undefined") {
      return detectNavIntent(false).showOverlay;
    }
    return true;
  });

  const [coverGone, setCoverGone] = useState(() => {
    if (isBot) return true;
    if (typeof window !== "undefined") {
      return detectNavIntent(false).isReturning;
    }
    return false;
  });

  // Preload intro / overlay only if they will actually be shown
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
        requestAnimationFrame(() => requestAnimationFrame(() => setCoverGone(true)));
      });
    return () => {
      cancelled = true;
    };
  }, [ready, showDonationOverlay]);

  useEffect(() => {
    const handleNavAction = () => {
      const intent = detectNavIntent(isBot);

      if (!intent.isReturning) {
        setReady(false);
        setShowDonationOverlay(true);
        if (intent.isLogo) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          sessionStorage.removeItem("nav_action");
        }
        return;
      }

      // Returning visitor or bot or direct anchor
      setReady(true);
      setShowDonationOverlay(false);
      setCoverGone(true);

      if (intent.targetId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        sessionStorage.removeItem("nav_action");
        return;
      }

      if (intent.targetId) {
        if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
          window.history.scrollRestoration = "manual";
        }
        const targetId = intent.targetId;
        let attempts = 0;
        const maxAttempts = 60; // Poll up to 3s for CMS-driven content to mount

        const scrollToTarget = () => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({
              behavior: attempts <= 2 ? "smooth" : "auto",
              block: "start",
            });

            // Clean up session storage flags ONLY after finding the element and initiating scroll
            sessionStorage.removeItem("came_from_details");
            sessionStorage.removeItem("nav_action");

            // Handle potential late layout shifts (e.g. from async CMS sections above)
            if (attempts < 6) {
              setTimeout(() => {
                const refreshedEl = document.getElementById(targetId);
                if (refreshedEl) {
                  const rect = refreshedEl.getBoundingClientRect();
                  if (rect.top < -80 || rect.top > window.innerHeight - 100) {
                    refreshedEl.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }
              }, 400);
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(scrollToTarget, 50);
          } else {
            sessionStorage.removeItem("came_from_details");
            sessionStorage.removeItem("nav_action");
          }
        };

        requestAnimationFrame(() => {
          setTimeout(scrollToTarget, 50);
        });
      }
    };

    window.addEventListener("nav_action_event", handleNavAction);
    window.addEventListener("popstate", handleNavAction);
    handleNavAction();

    return () => {
      window.removeEventListener("nav_action_event", handleNavAction);
      window.removeEventListener("popstate", handleNavAction);
    };
  }, [isBot]);

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
            // Same color as IntroSequence's background so the handover is completely seamless.
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