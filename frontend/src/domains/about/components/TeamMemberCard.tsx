"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type TeamMemberCardProps = {
  href?: string;
  name: string;
  designation?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  variant?: "trustee" | "team";
};

export default function TeamMemberCard({
  href,
  name,
  designation,
  imageUrl,
  description,
  variant = "trustee",
}: TeamMemberCardProps) {
  const idleBarClass =
    variant === "team" ? "bg-[#B89B6E]/90" : "bg-[#1C1C1C]/88";

  const inner = (
    <>
      {/* Photo */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover object-top grayscale transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 280px"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#E8E0D0] font-manrope text-sm text-[#9A9A9A]">
            No photo
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
        />
      </div>

      {/* Idle: name + role pinned at bottom */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 px-4 py-3.5 transition-opacity duration-300 group-hover:pointer-events-none group-hover:opacity-0",
          idleBarClass
        )}
      >
        <p className="truncate font-manrope text-sm font-semibold text-white sm:text-[15px]">
          {name}
        </p>
        {designation ? (
          <p className="mt-0.5 line-clamp-2 font-manrope text-[11px] leading-snug text-white/80 sm:text-xs">
            {designation}
          </p>
        ) : null}
      </div>

      {/*
        Hover panel: light wash slides up from bottom,
        covering the portrait with name + role + description.
      */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex translate-y-full flex-col bg-[#E8F0F6]/95 px-4 py-5 backdrop-blur-[2px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 sm:py-6",
          "group-hover:translate-y-0 group-focus-within:translate-y-0"
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <h3 className="font-manrope text-base font-bold tracking-tight text-[#0B2C4A] sm:text-lg">
            {name}
          </h3>
          {designation ? (
            <p className="mt-1 font-manrope text-xs font-medium leading-snug text-[#1A4A6E] sm:text-sm">
              {designation}
            </p>
          ) : null}
          {description ? (
            <p className="mt-3 font-manrope text-xs leading-relaxed text-[#163A58] sm:mt-4 sm:text-[13px] sm:leading-relaxed">
              {description}
            </p>
          ) : (
            <p className="mt-3 font-manrope text-xs text-[#1A4A6E]/60">
              No description added yet.
            </p>
          )}
        </div>
      </div>
    </>
  );

  const shellClass =
    "group relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#F3EEE3] shadow-[0_8px_24px_rgba(11,44,74,0.1)] ring-1 ring-black/5 outline-none transition duration-300 hover:shadow-[0_14px_32px_rgba(11,44,74,0.14)] focus-visible:ring-2 focus-visible:ring-[#0B2C4A]/40";

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        {inner}
      </Link>
    );
  }

  return <article className={shellClass}>{inner}</article>;
}
