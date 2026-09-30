"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const EXCLUDED_PREFIXES = ["/admin", "/login", "/api"];
const NAV_TIMEOUT_MS = 4000;
const WATERMARK = "HCG Foundation";
const WATERMARK_WORDS = WATERMARK.split(" ");
const WATERMARK_OFFSETS = WATERMARK_WORDS.map((_, index) =>
  WATERMARK_WORDS.slice(0, index).reduce((total, word) => total + word.length, 0),
);

const COVER = { duration: 650, easing: "cubic-bezier(0.76, 0, 0.24, 1)" };
const REVEAL = { duration: 1000, easing: "cubic-bezier(0.83, 0, 0.17, 1)" };
const LETTER_IN = { duration: 1000, delay: 180, stagger: 35, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const LETTER_OUT = { duration: 800, stagger: 18, easing: "cubic-bezier(0.87, 0, 0.13, 1)" };
const MIN_COVERED_MS = 1050;

function isExcluded(pathname: string) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<HTMLSpanElement[]>([]);
  const busyRef = useRef(false);
  const routeReadyRef = useRef<(() => void) | null>(null);

  const transitionTo = useCallback(
    async (href: string) => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      const content = contentRef.current;
      const letters = letterRefs.current.filter((node) => node?.isConnected);
      if (!overlay || !panel || !content) {
        router.push(href);
        return;
      }

      busyRef.current = true;
      overlay.style.visibility = "visible";

      const animations: Animation[] = [];
      const play = (
        element: HTMLElement,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => {
        const animation = element.animate(keyframes, { ...options, fill: "both" });
        animations.push(animation);
        return animation;
      };

      let navigated = false;
      try {
        const coveredAt = wait(MIN_COVERED_MS);

        panel.style.transformOrigin = "50% 100%";
        const cover = play(panel, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], COVER);
        play(
          content,
          [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
          COVER,
        );
        letters.forEach((letter, index) =>
          play(
            letter,
            [
              { transform: "translateY(105%) rotate(4deg)" },
              { transform: "translateY(0) rotate(0deg)" },
            ],
            {
              duration: LETTER_IN.duration,
              delay: LETTER_IN.delay + index * LETTER_IN.stagger,
              easing: LETTER_IN.easing,
            },
          ),
        );

        await cover.finished;

        const routeReady = new Promise<void>((resolve) => {
          const timeout = window.setTimeout(done, NAV_TIMEOUT_MS);
          function done() {
            window.clearTimeout(timeout);
            routeReadyRef.current = null;
            resolve();
          }
          routeReadyRef.current = done;
        });
        navigated = true;
        router.push(href);

        await Promise.all([routeReady, coveredAt]);
        await nextPaint();

        panel.style.transformOrigin = "50% 0%";
        const reveal = play(
          panel,
          [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
          REVEAL,
        );
        play(
          content,
          [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
          REVEAL,
        );
        letters.forEach((letter, index) =>
          play(letter, [{ transform: "translateY(0)" }, { transform: "translateY(-105%)" }], {
            duration: LETTER_OUT.duration,
            delay: index * LETTER_OUT.stagger,
            easing: LETTER_OUT.easing,
          }),
        );

        await reveal.finished;
      } catch {
        // An interrupted animation must never leave the curtain stuck over the page.
      } finally {
        if (!navigated) router.push(href);
        overlay.style.visibility = "hidden";
        animations.forEach((animation) => animation.cancel());
        busyRef.current = false;
      }
    },
    [router],
  );

  useEffect(() => {
    routeReadyRef.current?.();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (isExcluded(url.pathname) || isExcluded(window.location.pathname)) return;
      if (prefersReducedMotion()) return;

      // Take over navigation from next/link, but let any page handler that calls
      // preventDefault (modals, drag guards) keep the click to itself.
      let vetoed = false;
      const nativePreventDefault = event.preventDefault.bind(event);
      Object.defineProperty(event, "preventDefault", {
        configurable: true,
        value: () => {
          vetoed = true;
        },
      });
      Object.defineProperty(event, "defaultPrevented", {
        configurable: true,
        get: () => true,
      });
      nativePreventDefault();

      window.setTimeout(() => {
        if (vetoed || busyRef.current) return;
        const href = `${url.pathname}${url.search}${url.hash}`;
        // The home logo link replays the intro sequence, which is its own transition.
        if (url.pathname === "/" && sessionStorage.getItem("nav_action") === "logo") {
          router.push(href);
          return;
        }
        void transitionTo(href);
      }, 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, transitionTo]);

  return (
    <>
      {children}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-auto fixed inset-0 z-[9999] overflow-hidden"
        style={{ visibility: "hidden" }}
      >
        <div ref={panelRef} className="absolute inset-0 bg-[#FFF6D8]" />
        <div ref={contentRef} className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center font-tiempos-headline text-[17vw] font-light italic leading-[1.1] text-[#2a2622]/[0.08] sm:flex-row sm:gap-x-[0.28em] sm:text-[clamp(3rem,11vw,14rem)]">
            {WATERMARK_WORDS.map((word, wordIndex) => (
              <span
                key={word}
                className="block whitespace-nowrap"
                style={{ clipPath: "inset(0 -0.5em)" }}
              >
                {Array.from(word).map((char, charIndex) => {
                  const index = WATERMARK_OFFSETS[wordIndex] + charIndex;
                  return (
                    <span
                      key={charIndex}
                      ref={(node) => {
                        if (node) letterRefs.current[index] = node;
                      }}
                      className="inline-block"
                      style={{ transform: "translateY(105%)" }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
