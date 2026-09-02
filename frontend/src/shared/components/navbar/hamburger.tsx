"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import Typography from "@/lib/Typography";
import type { NavLink } from "./dropdown";

interface HamburgerButtonProps {
  isMenuOpen: boolean;
  onToggle: () => void;
}

export function HamburgerButton({ isMenuOpen, onToggle }: HamburgerButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
      className="xl:hidden shrink-0 relative h-6 w-6 p-2 text-white box-content"
    >
      <Menu
        className={`absolute inset-0 m-auto h-6 w-6 transition-all duration-300 ease-in-out ${
          isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
        strokeWidth={2}
      />
      <X
        className={`absolute inset-0 m-auto h-6 w-6 transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 rotate-0 scale-100 text-[#FED034]"
            : "opacity-0 -rotate-90 scale-50"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}

interface MobileMenuPanelProps {
  navLinks: NavLink[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  openDropdown: number | null;
  toggleDropdown: (index: number) => void;
  donateButton: { href: string; label: string };
  onDonate: () => void;
  onHomeNav?: (event: React.MouseEvent) => void;
}

export function MobileMenuPanel({
  navLinks,
  isMenuOpen,
  setIsMenuOpen,
  openDropdown,
  toggleDropdown,
  donateButton,
  onDonate,
  onHomeNav,
}: MobileMenuPanelProps) {
  const pathname = usePathname();

  return (
    <div
      className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? "max-h-[36rem] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
      }`}
    >
      <div className="flex flex-col items-start gap-1 bg-black/[0.18] px-[clamp(1rem,3vw,1.5rem)] pb-6 pt-3 border-t border-white/10 mt-1 text-left">
        {navLinks.map((link, i) => {
          const isOpen = openDropdown === i;

          return (
            <div key={i} className="w-full">
              {link.hasDropdown ? (
                <button
                  onClick={() => toggleDropdown(i)}
                  className={`group w-full flex items-center justify-between gap-2 py-3.5 text-left transition-all duration-300 ease-in-out delay-[var(--stagger-delay)] ${
                    isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                  style={
                    {
                      "--stagger-delay": isMenuOpen ? `${i * 60}ms` : "0ms",
                    } as React.CSSProperties
                  }
                >
                  <Typography variant="text-2"
                    as="span"
                    className={`font-light transition-colors duration-300 ${
                      isOpen ? "text-[#FED034]" : "text-white group-hover:text-[#FED034]"
                    }`}
                  >
                    {link.label}
                  </Typography>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ease-in-out ${
                      isOpen ? "rotate-180 text-[#FED034]" : "text-[#FFFFFF] group-hover:text-[#FED034]"
                    }`}
                    strokeWidth={2.5}
                  />
                </button>
              ) : (
                <Link
                  href={link.href}
                  onClick={(event) => {
                    setIsMenuOpen(false);
                    if (link.href === "/" && onHomeNav) onHomeNav(event);
                  }}
                  className={`group flex items-center py-3.5 transition-all duration-300 ease-in-out delay-[var(--stagger-delay)] ${
                    isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                  style={
                    {
                      "--stagger-delay": isMenuOpen ? `${i * 60}ms` : "0ms",
                    } as React.CSSProperties
                  }
                >
                  <Typography variant={link.href === pathname ? "text-1" : "text-2"}
                    as="span"
                    className="text-white font-light transition-colors duration-300 group-hover:text-[#FED034]"
                  >
                    {link.label}
                  </Typography>
                </Link>
              )}

              {/* Dropdown sub-items — paper roll accordion, squared corners */}
              {link.hasDropdown && link.dropdownItems && (
                <div
                  className={`grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="w-full min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#FED034]/50 ml-1 mb-2 pt-1">
                      {link.dropdownItems.map((item, j) => (
                        <Link
                          key={j}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group/item relative flex items-center overflow-hidden rounded-none py-2 pl-3 pr-3 transition-all duration-300 ease-out delay-[var(--stagger-delay)] ${
                            isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                          }`}
                          style={
                            {
                              "--stagger-delay": isOpen ? `${j * 50}ms` : "0ms",
                            } as React.CSSProperties
                          }
                        >
                          <span className="absolute inset-0 origin-left scale-x-0 bg-[#FED034]/10 transition-transform duration-300 ease-out group-hover/item:scale-x-100" />
                          <Typography variant="text-2"
                            as="span"
                            className="relative z-10 text-white font-light transition-colors duration-300 group-hover/item:text-[#FED034]"
                          >
                            {item.label}
                          </Typography>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Donate Button — only inside hamburger below sm (640px) */}
        <Link
          href={donateButton.href}
          onClick={(event) => {
            event.preventDefault();
            setIsMenuOpen(false);
            onDonate();
          }}
          className={`sm:hidden mt-3 inline-flex justify-center px-5 py-2.5 bg-[#FED034] hover:bg-[#e6bc2e] transition-all duration-300 ease-in-out delay-[var(--stagger-delay)] ${
            isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          }`}
          style={
            {
              "--stagger-delay": isMenuOpen ? `${navLinks.length * 60}ms` : "0ms",
            } as React.CSSProperties
          }
        >
          <Typography variant="button-4" as="span" className="text-[#262626]">
            {donateButton.label}
          </Typography>
        </Link>
      </div>
    </div>
  );
}