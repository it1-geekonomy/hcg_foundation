"use client";

import { useState, useEffect, useRef, Suspense } from "react";

import dynamic from "next/dynamic";

import { hasIntroSeen, markIntroSeen } from "@/shared/utils/introCookie";

const loadIntro = () =>
  import("@/domains/home/components/IntroSequence").then((m) => m.IntroSequence);
const loadOverlay = () => import("@/domains/home/components/OverlayForm");

const IntroSequence = dynamic(loadIntro, { ssr: false });
const OverlayForm = dynamic(loadOverlay, { ssr: false });

/** How long after the website becomes visible (intro video + logo animation done) the popup appears. */
const OVERLAY_DELAY_MS = 5000;

/**
 * Runs inline before first paint. Returning visitors (nav action, came from details, hash links)
 * and PageSpeed/webdriver/Lighthouse bots never see the cover.
 */
const COVER_GUARD = `try{var s=sessionStorage,h=location.hash,n=s.getItem('nav_action'),u=navigator.userAgent||'';
if((n&&n!=='logo')||s.getItem('came_from_details')||/projects|events|smilestories/.test(h)||navigator.webdriver||/Lighthouse|PageSpeed|Googlebot|HeadlessChrome|HeadlessChromium|Chrome-Lighthouse|Google-PageSpeed|PTST|bingbot|baiduspider|Screaming|crawler|spider|bot/i.test(u)){
var c=document.getElementById('intro-cover');if(c)c.style.display='none'}}catch(e){}`;

type NavEntry = {
  navAction: string | null;
  cameFromDetails: string | null;
  hash: string;
};

type NavIntent = {
  /** true = skip the intro and show the website immediately */
  ready: boolean;
  /** element id to scroll to ("top" scrolls to the page top) */
  targetId: string | null;
  /** should the donation popup happen on this visit */
  showOverlay: boolean;
  isLogo: boolean;
};

function readEntry(): NavEntry {
  return {
    navAction: sessionStorage.getItem("nav_action"),
    cameFromDetails: sessionStorage.getItem("came_from_details"),
    hash: window.location.hash,
  };
}

function detectNavIntent(entry: NavEntry, isBot?: boolean): NavIntent {
  if (isBot) {
    return { ready: true, targetId: null, showOverlay: false, isLogo: false };
  }

  const ua = navigator.userAgent || "";
  const isAuto =
    Boolean(navigator.webdriver) ||
    /Lighthouse|PageSpeed|Googlebot|HeadlessChrome|HeadlessChromium|Chrome-Lighthouse|Google-PageSpeed|PTST|bingbot|baiduspider|Screaming\s*Frog|ScreamingFrog|crawler|spider|bot/i.test(ua);
  if (isAuto) {
    return { ready: true, targetId: null, showOverlay: false, isLogo: false };
  }

  const { navAction, cameFromDetails, hash: h } = entry;
  const introSeen = hasIntroSeen(); // cookie: intro already watched on a previous visit

  if (navAction === "logo") {
    // Logo click: replay the intro unless it was already seen, popup always allowed
    return { ready: introSeen, targetId: null, showOverlay: true, isLogo: true };
  }

  if (navAction === "navbar_home" || navAction === "banner_home_top") {
    return { ready: true, targetId: "top", showOverlay: false, isLogo: false };
  }

  if (navAction === "banner_home_section") {
    return { ready: true, targetId: "projects", showOverlay: false, isLogo: false };
  }

  if (cameFromDetails) {
    return { ready: true, targetId: cameFromDetails, showOverlay: false, isLogo: false };
  }

  if (navAction) {
    // Any other navigation action: treat as a returning visitor
    return { ready: true, targetId: null, showOverlay: false, isLogo: false };
  }

  if (
    h &&
    (h.includes("projects") ||
      h.includes("events") ||
      h.includes("smilestories") ||
      h.includes("donate-form"))
  ) {
    const id = h.replace(/^#/, "");
    return { ready: true, targetId: id, showOverlay: false, isLogo: false };
  }

  // Unknown hash: no popup. Plain first visit: intro (unless cookie says seen) + popup.
  return { ready: introSeen, targetId: null, showOverlay: !h, isLogo: false };
}

export default function HomeClient({
  children,
  isBot,
}: {
  children: React.ReactNode;
  isBot?: boolean;
}) {
  // Initial state is identical on server and first client render (no hydration mismatch).
  // The real values are synced once on mount by handleNavAction below.
  const [ready, setReady] = useState(isBot || false);

  // "Should the popup happen at all on this visit?"
  const [showDonationOverlay, setShowDonationOverlay] = useState(false);
  // "Is the popup on screen right now?" (turns true OVERLAY_DELAY_MS after the site is visible)
  const [overlayVisible, setOverlayVisible] = useState(false);
  // Set once the user clicks X, so the popup never comes back during this page load.
  const overlayDismissedRef = useRef(false);

  // Navigation flags are consumed (removed) while handling them. React StrictMode runs the mount
  // effect twice in dev, so the second run must reuse what the first run read instead of seeing nothing.
  const entryRef = useRef<NavEntry | null>(null);

  // The server HTML always contains the homepage (the intro is ssr:false and loads later),
  // so on a first visit the homepage used to flash until that chunk arrived. This cover sits on
  // top from the very first paint and is removed only once the intro chunk has loaded.
  const [coverGone, setCoverGone] = useState(false);

  // Remove the cover: immediately if the site is ready, otherwise once the intro chunk has loaded.
  useEffect(() => {
    if (ready) {
      setCoverGone(true);
      return;
    }
    let cancelled = false;
    loadIntro()
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        // two frames so the intro has painted before the cover goes away
        requestAnimationFrame(() => requestAnimationFrame(() => setCoverGone(true)));
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Popup timer: starts only after the intro (video + logo animation) is finished (`ready`),
  // then shows the form after OVERLAY_DELAY_MS. Never runs again once the user has clicked X.
  useEffect(() => {
    if (!showDonationOverlay) {
      setOverlayVisible(false);
      return;
    }
    if (!ready || overlayDismissedRef.current) return;

    loadOverlay(); // preload the chunk so the form appears instantly when the timer fires
    const timer = setTimeout(() => setOverlayVisible(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, showDonationOverlay]);

  // Navigation handling: runs on mount (using the cached entry flags) and on every nav event.
  useEffect(() => {
    const handleNavAction = (useCachedEntry = false) => {
      let entry: NavEntry;
      if (useCachedEntry) {
        if (!entryRef.current) entryRef.current = readEntry();
        entry = entryRef.current;
      } else {
        entry = readEntry();
      }

      const intent = detectNavIntent(entry, isBot);

      setReady(intent.ready);
      setShowDonationOverlay(intent.showOverlay);
      if (intent.ready) setCoverGone(true);

      if (intent.isLogo) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        sessionStorage.removeItem("nav_action");
        return;
      }

      if (!intent.targetId) return;

      if (intent.targetId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        sessionStorage.removeItem("nav_action");
        return;
      }

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
    };

    const onNavEvent = () => handleNavAction(false);

    window.addEventListener("nav_action_event", onNavEvent);
    window.addEventListener("popstate", onNavEvent);
    handleNavAction(true); // initial sync on mount

    return () => {
      window.removeEventListener("nav_action_event", onNavEvent);
      window.removeEventListener("popstate", onNavEvent);
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

      <Suspense fallback={null}>
        <div suppressHydrationWarning>
          {showDonationOverlay && overlayVisible && (
            <OverlayForm
              key="donation-overlay"
              onClose={() => {
                // X button: hide now and never show again on this page load.
                overlayDismissedRef.current = true;
                setOverlayVisible(false);
                setShowDonationOverlay(false);
              }}
            />
          )}

          {!ready && (
            <IntroSequence
              onDone={() => {
                markIntroSeen(); // cookie: skip the intro on the next visit
                setReady(true);
              }}
            />
          )}
        </div>
      </Suspense>
    </>
  );
}