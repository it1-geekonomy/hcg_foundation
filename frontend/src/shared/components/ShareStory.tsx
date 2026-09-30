"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
} from "@/shared/components/icons/SocialIcons";

interface ShareStoryProps {
  title?: string;
  className?: string;
}

function ShareIconButton({
  label,
  onClick,
  forceOpen = false,
  children,
}: {
  label: string;
  onClick: () => void;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isHovered || forceOpen;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip label */}
      <span
        className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2
                   whitespace-nowrap rounded-full border border-white/40 bg-[#FDC61D]/30
                   px-3 py-1 text-xs font-semibold text-[#382E07] shadow-lg backdrop-blur-md
                   transition-all duration-200 ease-out
                   ${
                     isOpen
                       ? "opacity-100 scale-100 -translate-y-full"
                       : "opacity-0 scale-90 -translate-y-1/2"
                   }`}
      >
        {label}
      </span>

      <button
        type="button"
        onClick={(e) => {
          onClick();
          setIsHovered(false);
          e.currentTarget.blur();
        }}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label={label}
        className="relative flex size-8 sm:size-9 items-center justify-center rounded-full
                   bg-transparent text-[#382E07] shadow-none
                   transition-all duration-300 ease-out
                   hover:bg-[#FDC61D] hover:shadow-xs hover:scale-110 hover:-translate-y-0.5
                   active:scale-95 cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B510] focus-visible:ring-offset-2"
      >
        {children}
      </button>
    </div>
  );
}

export default function ShareStory({
  title = "Share this story",
  className = "",
}: ShareStoryProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1000);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  const handleShareWhatsapp = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://api.whatsapp.com/send?text=${url}`, "_blank");
    }
  };

  const handleShareInstagram = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedInsta(true);
      setTimeout(() => setCopiedInsta(false), 1000);
    }
  };

  return (
    <div className={`mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
      <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
        {title}
      </Typography>
      <div className="flex items-center gap-2">
        <ShareIconButton label="Facebook" onClick={handleShareFacebook}>
          <FacebookIcon className="size-4 fill-current" />
        </ShareIconButton>

        <ShareIconButton
          label={copiedInsta ? "Link copied!" : "Instagram"}
          onClick={handleShareInstagram}
          forceOpen={copiedInsta}
        >
          {copiedInsta ? (
            <Check className="size-4" />
          ) : (
            <InstagramIcon className="size-4 fill-current" />
          )}
        </ShareIconButton>

        <ShareIconButton label="WhatsApp" onClick={handleShareWhatsapp}>
          <WhatsappIcon className="size-4 fill-current" />
        </ShareIconButton>

        <ShareIconButton
          label={copiedLink ? "Link copied!" : "Copy link"}
          onClick={handleCopyLink}
          forceOpen={copiedLink}
        >
          {copiedLink ? (
            <Check className="size-4 text-[#382E07]" />
          ) : (
            <LinkIcon className="size-4 text-[#382E07]" />
          )}
        </ShareIconButton>
      </div>
    </div>
  );
}