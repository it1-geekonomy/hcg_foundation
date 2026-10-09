"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Typography from "@/lib/Typography";
import { navLinks, navbarContent } from "@/domains/home/constants/navbar";
import { scrollHomeToHero } from "@/domains/home/utils/heroScrollReset";
import DesktopDropdown, { NavLabel } from "./dropdown";
import { HamburgerButton, MobileMenuPanel } from "./hamburger";

/**
 * Navbar glass backgrounds (sm and up; phones always use the solid #2a2622 bar).
 * - Default: the original look (black at 18% + 60px blur).
 * - Mac: a darker, blackish glass so the white nav text stays readable.
 *   Uses an explicit rgba() (not bg-black/[x], which compiles to color-mix()
 *   and renders inconsistently in Safari), the -webkit- blur prefix, and its own
 *   compositing layer so Safari paints the blur correctly.
 */
const navGlassDefault = "bg-black/[0.18] backdrop-blur-[60px]";
const navGlassMac =
  "bg-[rgba(0,0,0,0.55)] backdrop-blur-[60px] [-webkit-backdrop-filter:blur(60px)] [transform:translateZ(0)] isolate";

function detectMac() {
  if (typeof navigator === "undefined") return false;
  const isMacPlatform = /Mac/i.test(navigator.platform || navigator.userAgent);
  // iPadOS reports "MacIntel" but has a touchscreen; treat it as non-Mac.
  return isMacPlatform && navigator.maxTouchPoints <= 1;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<number | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);

  // Detected after mount so server and client markup match (no hydration warning).
  useEffect(() => {
    setIsMac(detectMac());
  }, []);

  useEffect(() => {
    setOpenDesktopDropdown(null);
    setOpenDropdown(null);
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.dataset.navMenuOpen = "true";
    return () => {
      delete document.body.dataset.navMenuOpen;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(e.target as Node)
      ) {
        setOpenDesktopDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the open desktop dropdown as soon as the user scrolls
  useEffect(() => {
    if (openDesktopDropdown === null) return;

    const handleDropdownScroll = () => {
      setOpenDesktopDropdown(null);
    };

    window.addEventListener("scroll", handleDropdownScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleDropdownScroll);
  }, [openDesktopDropdown]);

  const toggleDropdown = (index: number) => {
    setOpenDropdown((prev) => (prev === index ? null : index));
  };

  const toggleDesktopDropdown = (index: number) => {
    setOpenDesktopDropdown((prev) => (prev === index ? null : index));
  };

  const scrollToDonateForm = () => {
    document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHomeNav = (event: ReactMouseEvent) => {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollHomeToHero({ smooth: true });
  };

  return (
    <>
      {/* Reserves the bar height only below 640px so page sections start under it. */}
      <div aria-hidden="true" className="h-[calc(3.5rem+1px)] w-full sm:hidden" />
      <div
        id="site-navbar"
        className={`fixed z-50 transition-transform duration-300 ease-in-out top-0 inset-x-0 sm:top-[clamp(0.75rem,2vw,1.5rem)] sm:inset-x-[clamp(1rem,8vw,8rem)] lg:inset-x-4 xl:inset-x-[clamp(0.5rem,3vw,4rem)] 2xl:inset-x-[clamp(1rem,10vw,10rem)] ${isVisible ? "translate-y-0" : "-translate-y-[150%]"
          }`}
      >
        <nav
          className={`w-full border border-white/10 ${isMac ? navGlassMac : navGlassDefault} px-[clamp(1rem,2vw,1.5rem)] max-sm:border-x-0 max-sm:border-t-0 max-sm:bg-[#2a2622] max-sm:px-0 max-sm:backdrop-blur-none max-sm:[-webkit-backdrop-filter:none] max-sm:[transform:none] lg:px-0`}
        >
          <div className="flex items-center justify-between gap-4 h-[clamp(3.5rem,6vw,4.5rem)] max-sm:h-14 max-sm:px-[clamp(1rem,2vw,1.5rem)] lg:ml-5 xl:ml-8">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => {
                setOpenDesktopDropdown(null);
                setOpenDropdown(null);
                setIsMenuOpen(false);
                sessionStorage.setItem("nav_action", "logo");
                window.dispatchEvent(new Event("nav_action_event"));
              }}
              className="flex h-full shrink-0 items-center py-2 transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={navbarContent.logo.src}
                alt={navbarContent.logo.alt}
                width={140}
                height={40}
                className="h-full w-auto"
                priority
              />
            </Link>

            {/* Nav Links — desktop (lg and up) */}
            <div ref={desktopNavRef} className="hidden lg:flex items-center gap-5 xl:gap-[clamp(1.75rem,2vw,2rem)]">
              {navLinks.map((link, i) => {
                const isChildActive = Boolean(
                  link.hasDropdown &&
                    link.dropdownItems?.some((item) => item.href === pathname)
                );
                const isActive = link.href === pathname || isChildActive;

                if (!link.hasDropdown) {
                  return (
                    <Link
                      key={i}
                      href={link.href}
                      onClick={(e) => {
                        setOpenDesktopDropdown(null);
                        if (link.href !== "/") return;
                        if (pathname === "/") {
                          handleHomeNav(e);
                          return;
                        }
                        sessionStorage.setItem("nav_action", "navbar_home");
                        window.dispatchEvent(new Event("nav_action_event"));
                      }}
                      aria-current={link.href === pathname ? "page" : undefined}
                      className="group/nav relative flex items-center py-1"
                    >
                      <NavLabel label={link.label} isActive={isActive} />
                    </Link>
                  );
                }

                return (
                  <DesktopDropdown
                    key={i}
                    link={link}
                    isActive={isActive}
                    isOpen={openDesktopDropdown === i}
                    onToggle={() => toggleDesktopDropdown(i)}
                    onOpen={() => setOpenDesktopDropdown(i)}
                    onClose={() =>
                      setOpenDesktopDropdown((prev) => (prev === i ? null : prev))
                    }
                    onItemClick={() => setOpenDesktopDropdown(null)}
                  />
                );
              })}
            </div>

            {/* Right-side controls */}
            <div className="flex items-center gap-3">
              {/* Donate Button — visible lg and up, next to nav links */}
              <Link
                href={navbarContent.donateButton.href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToDonateForm();
                }}
                className="hidden lg:inline-block shrink-0 px-4 py-2 bg-[#FED034] mr-4 transition-[background-color,transform] duration-200 hover:bg-[#FFDA55] active:scale-[0.98] xl:px-5 xl:py-2.5 xl:mr-6"
              >
                <Typography variant="button-4" as="span" className="text-[#262626] font-manrope font-bold lg:max-xl:!text-[15px]">
                  {navbarContent.donateButton.label}
                </Typography>
              </Link>

              {/* Donate Button — visible sm to lg, sits before hamburger */}
              <Link
                href={navbarContent.donateButton.href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToDonateForm();
                }}
                className="hidden sm:inline-block lg:hidden shrink-0 px-5 py-2.5 bg-[#FED034] transition-[background-color,transform] duration-200 hover:bg-[#FFDA55] active:scale-[0.98]"
              >
                <Typography variant="button-4" as="span" className="text-[#262626] font-manrope font-bold">
                  {navbarContent.donateButton.label}
                </Typography>
              </Link>

              {/* Hamburger — below lg, animated icon swap */}
              <HamburgerButton
                isMenuOpen={isMenuOpen}
                onToggle={() => setIsMenuOpen((prev) => !prev)}
              />
            </div>
          </div>

          {/* Mobile/tablet dropdown panel (below lg) */}
          <MobileMenuPanel
            navLinks={navLinks}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
            donateButton={navbarContent.donateButton}
            onDonate={scrollToDonateForm}
            onHomeNav={handleHomeNav}
          />
        </nav>
      </div>
    </>
  );
}