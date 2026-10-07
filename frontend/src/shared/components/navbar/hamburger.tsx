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
      className="lg:hidden shrink-0 relative h-6 w-6 p-2 text-white box-content"
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
      className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? "max-h-[36rem] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
      }`}
    >
      {/* Floating glass card: equal margin on left, right, and bottom so the
          background photo shows evenly on all open sides, matching the
          existing left/right inset from the parent container. */}
      <div className="mx-[clamp(1rem,3vw,1.5rem)] mb-[clamp(1rem,3vw,1.5rem)] mt-1 rounded-lg overflow-hidden max-sm:mx-0 max-sm:mb-0 max-sm:mt-0 max-sm:rounded-none">
        <div className="flex flex-col bg-black/[0.18] px-[clamp(1rem,3vw,1.5rem)] pb-4 pt-1 border-t border-white/10 text-left max-h-[70vh] overflow-y-auto overscroll-contain max-sm:bg-transparent max-sm:max-h-[calc(100dvh-3.5rem)]">
          <ul className="flex flex-col divide-y divide-white/[0.07]">
            {navLinks.map((link, i) => {
              const isOpen = openDropdown === i;
              const isChildActive =
                link.hasDropdown && link.dropdownItems?.some((item) => item.href === pathname);
              const isLinkActive = link.href === pathname || isChildActive;
              const rowClass = `flex w-full items-center justify-between gap-3 py-3.5 text-left font-manrope text-base leading-snug transition-colors duration-200 ${
                isLinkActive ? "font-semibold text-[#FED034]" : "font-medium text-white/90 hover:text-white"
              }`;

              return (
                <li
                  key={i}
                  className={`transition-[opacity,transform] duration-300 ease-out ${
                    isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                  }`}
                  style={{ transitionDelay: isMenuOpen ? `${i * 40}ms` : "0ms" }}
                >
                  {link.hasDropdown ? (
                    <button
                      type="button"
                      onClick={() => toggleDropdown(i)}
                      aria-expanded={isOpen}
                      className={rowClass}
                    >
                      {link.label}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180 text-[#FED034]" : "text-white/60"
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={(event) => {
                        setIsMenuOpen(false);
                        if (link.href === "/" && onHomeNav) onHomeNav(event);
                      }}
                      aria-current={link.href === pathname ? "page" : undefined}
                      className={rowClass}
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.hasDropdown && link.dropdownItems && (
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <ul className="mb-3 ml-1 flex flex-col border-l border-white/15">
                          {link.dropdownItems.map((item) => {
                            const isItemActive = item.href === pathname;

                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  aria-current={isItemActive ? "page" : undefined}
                                  tabIndex={isOpen ? 0 : -1}
                                  className={`-ml-px flex border-l-2 py-2 pl-4 pr-2 font-manrope text-[15px] leading-snug transition-colors duration-200 ${
                                    isItemActive
                                      ? "border-[#FED034] font-semibold text-[#FED034]"
                                      : "border-transparent font-medium text-white/70 hover:border-white/40 hover:text-white"
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Donate Button — only inside hamburger below sm (640px) */}
          <Link
            href={donateButton.href}
            onClick={(event) => {
              event.preventDefault();
              setIsMenuOpen(false);
              onDonate();
            }}
            className={`sm:hidden mt-3 flex w-full justify-center bg-[#FED034] px-5 py-3 transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-[#FFDA55] ${
              isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
            }`}
            style={{ transitionDelay: isMenuOpen ? `${navLinks.length * 40}ms` : "0ms" }}
          >
            <Typography variant="button-4" as="span" className="font-manrope font-bold text-[#262626]">
              {donateButton.label}
            </Typography>
          </Link>
        </div>
      </div>
    </div>
  );
}