"use client";

import { useEffect, useRef } from "react";
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
  onOpen?: () => void;
  onClose?: () => void;
  onItemClick?: () => void;
}

/** Hover grace period so moving the mouse from the trigger into the panel doesn't close it. */
const HOVER_CLOSE_DELAY_MS = 140;

/** Shared top-level nav label styling: steady weight (no layout shift) with a gold underline for hover/active. */
export function NavLabel({
  label,
  isActive,
  isOpen = false,
}: {
  label: string;
  isActive: boolean;
  isOpen?: boolean;
}) {
  return (
    <span className="relative inline-flex flex-col">
      <Typography
        variant="text-2"
        as="span"
        className={`whitespace-nowrap font-manrope font-medium transition-colors duration-200 lg:max-xl:!text-[15px] ${
          isActive || isOpen ? "text-white" : "text-white/85 group-hover/nav:text-white"
        }`}
      >
        {label}
      </Typography>
      <span
        aria-hidden="true"
        className={`absolute -bottom-1.5 left-0 h-[2px] w-full origin-left rounded-full bg-[#FED034] transition-transform duration-300 ease-out ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
        }`}
      />
    </span>
  );
}

export default function DesktopDropdown({
  link,
  isActive,
  isOpen,
  onToggle,
  onOpen,
  onClose,
  onItemClick,
}: DesktopDropdownProps) {
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerType = useRef<string>("");

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(() => cancelClose, []);

  return (
    <div
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        onOpen?.();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        closeTimer.current = setTimeout(() => onClose?.(), HOVER_CLOSE_DELAY_MS);
      }}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          lastPointerType.current = e.pointerType;
        }}
        onClick={(e) => {
          // With a mouse, hover already opened the menu, so a click must not close it.
          // Touch and keyboard (detail === 0) still toggle normally.
          const viaMouse = e.detail > 0 && lastPointerType.current === "mouse";
          if (viaMouse && isOpen) return;
          onToggle();
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group/nav relative flex items-center gap-1.5 py-1"
      >
        <NavLabel label={link.label} isActive={isActive} isOpen={isOpen} />
        <ChevronDown
          className={`h-4 w-4 text-white/80 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Hover bridge: only as wide as the trigger, so it can never overlap a neighbouring
          dropdown. Inert while closed. */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-full h-4 ${isOpen ? "" : "pointer-events-none"}`}
      />

      {/* Panel wrapper never captures the pointer itself (its transparent pt-4 gap and any
          extra width would otherwise sit on top of neighbouring triggers). Only the visible
          card is interactive, and only while open. */}
      <div
        aria-hidden={!isOpen}
        className={`pointer-events-none absolute left-1/2 top-full z-10 -translate-x-1/2 pt-4 transition-[opacity,transform,visibility] duration-200 ease-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1.5 opacity-0"
        }`}
      >
        <div
          className={`relative min-w-[15rem] overflow-hidden rounded-xl border border-white/10 bg-[#1b1813]/95 p-1.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#FED034]/80 to-transparent"
          />
          <ul className="flex flex-col">
            {link.dropdownItems?.map((item, j) => {
              const isItemActive = item.href === pathname;

              return (
                <li
                  key={item.href}
                  className={`transition-[opacity,transform] duration-200 ease-out ${
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                  }`}
                  style={{ transitionDelay: isOpen ? `${40 + j * 30}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    aria-current={isItemActive ? "page" : undefined}
                    tabIndex={isOpen ? 0 : -1}
                    className={`group/item flex items-center justify-between gap-6 whitespace-nowrap rounded-lg px-3.5 py-2.5 font-manrope text-[15px] leading-snug transition-colors duration-150 ${
                      isItemActive
                        ? "bg-[#FED034]/10 font-semibold text-[#FED034]"
                        : "font-medium text-white/85 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {item.label}
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-[#FED034] transition-[opacity,transform] duration-200 ease-out ${
                        isItemActive
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1.5 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                      }`}
                      strokeWidth={2.25}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}