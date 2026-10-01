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

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export default function ShareStory({
  title = "Share this story",
  className = "",
}: ShareStoryProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1000);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };

  const handleShareWhatsapp = () => {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`${document.title} ${window.location.href}`);
    openInNewTab(`https://api.whatsapp.com/send?text=${text}`);
  };

  const handleShareInstagram = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    // Mobile: native share sheet (Instagram shows up if installed)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        // cancelled or failed -> fall through to copy + open
      }
    }

    // Desktop / fallback: open Instagram first (avoids popup blockers),
    // then copy the link so the user can paste it.
    openInNewTab("https://www.instagram.com/");
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedInsta(true);
      setTimeout(() => setCopiedInsta(false), 1500);
    }
  };

  return (
    <div
      className={`mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}
    >
      <Typography
        variant="body-10"
        as="span"
        className="font-argestadisplay font-normal text-[#C08600]"
      >
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