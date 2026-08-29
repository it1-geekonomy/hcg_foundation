"use client";

import Link from "next/link";
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
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick?: () => void;
}

export default function DesktopDropdown({
  link,
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}: DesktopDropdownProps) {
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group relative flex items-center gap-1 py-1"
      >
        <Typography variant="text-2"
          as="span"
          className={`transition-colors duration-300 ${
            isOpen ? "text-[#FED034]" : "text-white group-hover:text-[#FED034]"
          }`}
        >
          {link.label}
        </Typography>
        <ChevronDown
          className={`h-4 w-4 transition-all duration-300 ease-in-out ${
            isOpen
              ? "rotate-180 text-[#FED034]"
              : "rotate-0 text-[#FFFFFF] group-hover:text-[#FED034]"
          }`}
          strokeWidth={2.5}
        />
        <span
          className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-[#FED034] transition-transform duration-300 ease-out ${
            isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </button>

      {/* Desktop dropdown — paper roll grow, fixed width on outer wrapper, squared corners */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-6 w-64 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Pointer arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-4 w-3 h-3 rotate-45 bg-[#1c1c1c] border-l-2 border-t-2 border-[#FED034]/70 transition-transform duration-300 ease-out ${
            isOpen ? "scale-100" : "scale-0"
          }`}
        />

        {/* Grid-rows trick: smooth height grow, no text distortion */}
        <div
          className={`grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="w-full min-h-0 overflow-hidden">
            <div className="relative w-full rounded border-2 border-[#FED034]/70 bg-[#1c1c1c] shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col p-2">
                {link.dropdownItems?.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    onClick={onItemClick}
                    className={`group/item relative flex items-center justify-between overflow-hidden rounded px-3.5 py-3 transition-all duration-300 ease-out delay-[var(--stagger-delay)] ${
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                    style={
                      {
                        "--stagger-delay": isOpen ? `${j * 50}ms` : "0ms",
                      } as React.CSSProperties
                    }
                  >
                    {/* Sweep-fill background */}
                    <span className="absolute inset-0 origin-left scale-x-0 bg-[#FED034]/10 transition-transform duration-300 ease-out group-hover/item:scale-x-100" />
                    <Typography variant="text-2"
                      as="span"
                      className="relative z-10 text-white transition-colors duration-300 group-hover/item:text-[#FED034]"
                    >
                      {item.label}
                    </Typography>
                    <ChevronRight
                      className="relative z-10 h-4 w-4 shrink-0 -translate-x-2 text-[#FED034] opacity-0 transition-all duration-300 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                      strokeWidth={2.5}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}