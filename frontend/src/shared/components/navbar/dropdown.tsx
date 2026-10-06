"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";

export interface DropdownItem {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

interface DesktopDropdownProps {
  link: NavLink;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}

export default function DesktopDropdown({
  link,
  isActive,
  isOpen,
  onToggle,
  onItemClick,
}: DesktopDropdownProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative flex items-center gap-1 py-1"
      >
        <Typography
          variant="text-2"
          as="span"
          className={`font-manrope text-white transition-colors duration-300 ${
            isActive ? "font-bold" : "font-medium"
          }`}
        >
          {link.label}
        </Typography>
        <ChevronDown
          className={`h-4 w-4 text-white transition-all duration-300 ease-in-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          strokeWidth={2.5}
        />
      </button>

      {/* Desktop dropdown — xl and up only. Below 1280px the hamburger menu is separate. */}
      <div
        className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-5 transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div
          className={`absolute left-1/2 top-3.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#FED034] bg-[#141414] shadow-[-4px_-4px_12px_rgba(254,208,52,0.25)] transition-transform duration-300 ease-out ${
            isOpen ? "scale-100" : "scale-0"
          }`}
        />

        <div
          className={`grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="w-full min-h-0 overflow-hidden">
            <div className="relative w-full overflow-hidden rounded-xl border border-[#FED034]/80 bg-[#141414]/95 shadow-[0_18px_50px_rgba(0,0,0,0.5),0_0_28px_rgba(254,208,52,0.22)] backdrop-blur-md">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FED034] to-transparent"
              />
              <div className="flex flex-col gap-0.5 p-2 pt-3">
                {link.dropdownItems?.map((item, j) => {
                  const isItemActive = item.href === pathname;

                  return (
                    <Link
                      key={j}
                      href={item.href}
                      onClick={onItemClick}
                      className={`group/item relative flex items-center justify-between overflow-hidden rounded-lg px-3.5 py-2.5 transition-all duration-300 ease-out delay-[var(--stagger-delay)] ${
                        isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                      } ${isItemActive ? "bg-[#FED034]/15" : "hover:bg-white/[0.04]"}`}
                      style={
                        {
                          "--stagger-delay": isOpen ? `${j * 45}ms` : "0ms",
                        } as React.CSSProperties
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 left-0 w-[3px] -translate-y-1/2 rounded-r bg-[#FED034] transition-all duration-300 ${
                          isItemActive ? "h-2/3" : "h-0 group-hover/item:h-1/2"
                        }`}
                      />
                      <Typography
                        variant="text-2"
                        as="span"
                        className={`relative z-10 pl-1.5 font-manrope transition-colors duration-300 ${
                          isItemActive
                            ? "font-bold text-[#FED034]"
                            : "font-medium text-white group-hover/item:text-[#FED034]"
                        }`}
                      >
                        {item.label}
                      </Typography>
                      <ChevronRight
                        className={`relative z-10 h-4 w-4 shrink-0 transition-all duration-300 ease-out ${
                          isItemActive
                            ? "translate-x-0 text-[#FED034] opacity-100"
                            : "-translate-x-2 text-[#FED034] opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                        }`}
                        strokeWidth={2.5}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}