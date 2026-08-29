"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Typography from "@/lib/Typography";
import { navLinks, navbarContent } from "@/domains/home/constants/navbar";
import DesktopDropdown from "./dropdown";
import { HamburgerButton, MobileMenuPanel } from "./hamburger";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<number | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const toggleDropdown = (index: number) => {
    setOpenDropdown((prev) => (prev === index ? null : index));
  };

  const toggleDesktopDropdown = (index: number) => {
    setOpenDesktopDropdown((prev) => (prev === index ? null : index));
  };

  const handleDesktopEnter = (index: number) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDesktopDropdown(index);
  };

  const handleDesktopLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDesktopDropdown(null);
    }, 150);
  };

  return (
    <div
      className={`fixed top-[clamp(0.75rem,2vw,1.5rem)] inset-x-[clamp(1rem,8vw,8rem)] z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-[150%]"
      }`}
    >
      <nav className="max-w-full border border-white/10 bg-white/[0.08] backdrop-blur-[60px] px-[clamp(1rem,2vw,1.5rem)]">
        <div className="flex items-center justify-between h-[clamp(3.5rem,6vw,4.5rem)]">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-transform duration-300 hover:scale-105">
            <Image
              src={navbarContent.logo.src}
              alt={navbarContent.logo.alt}
              width={140}
              height={40}
              className="h-[clamp(2rem,4vw,2.5rem)] w-auto"
              priority
            />
          </Link>

          {/* Nav Links — desktop (xl and up) */}
          <div ref={desktopNavRef} className="hidden xl:flex items-center gap-[clamp(1.75rem,2vw,2rem)]">
            {navLinks.map((link, i) => {
              if (!link.hasDropdown) {
                return (
                  <Link
                    key={i}
                    href={link.href}
                    className="group relative flex items-center gap-1 py-1"
                  >
                    <Typography
                      variant="body-lg"
                      as="span"
                      className="font-manrope font-bold text-[#FFFFFF] transition-colors duration-300 group-hover:text-[#FED034]"
                    >
                      {link.label}
                    </Typography>
                    <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#FED034] transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                );
              }

              return (
                <DesktopDropdown
                  key={i}
                  link={link}
                  isOpen={openDesktopDropdown === i}
                  onToggle={() => toggleDesktopDropdown(i)}
                  onMouseEnter={() => handleDesktopEnter(i)}
                  onMouseLeave={handleDesktopLeave}
                  onItemClick={() => setOpenDesktopDropdown(null)}
                />
              );
            })}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-3">
            {/* Donate Button — visible xl and up, next to nav links */}
            <Link
              href={navbarContent.donateButton.href}
              className="hidden xl:inline-block shrink-0 px-5 py-2.5 bg-[#FED034] hover:bg-[#e6bc2e] transition-all duration-300 hover:shadow-[0_0_20px_rgba(254,208,52,0.5)]"
            >
              <Typography variant="body-lg" as="span" className="font-manrope font-bold text-[#262626]">
                {navbarContent.donateButton.label}
              </Typography>
            </Link>

            {/* Donate Button — visible sm to xl, sits before hamburger */}
            <Link
              href={navbarContent.donateButton.href}
              className="hidden sm:inline-block xl:hidden shrink-0 px-5 py-2.5 bg-[#FED034] hover:bg-[#e6bc2e] transition-all duration-300 hover:shadow-[0_0_20px_rgba(254,208,52,0.5)]"
            >
              <Typography variant="body-lg" as="span" className="font-manrope font-bold text-[#262626]">
                {navbarContent.donateButton.label}
              </Typography>
            </Link>

            {/* Hamburger — below xl, animated icon swap */}
            <HamburgerButton
              isMenuOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen((prev) => !prev)}
            />
          </div>
        </div>

        {/* Mobile/tablet dropdown panel (below xl) */}
        <MobileMenuPanel
          navLinks={navLinks}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          donateButton={navbarContent.donateButton}
        />
      </nav>
    </div>
  );
}