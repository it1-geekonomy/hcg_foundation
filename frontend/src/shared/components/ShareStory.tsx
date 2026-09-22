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
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  };

  const handleShareWhatsapp = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://api.whatsapp.com/send?text=${url}`, '_blank');
    }
  };

  const handleShareInstagram = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedInsta(true);
      setTimeout(() => setCopiedInsta(false), 2000);
    }
  };

  return (
    <div className={`mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
      <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
        {title}
      </Typography>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShareFacebook}
          title="Share on Facebook"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <FacebookIcon className="size-4 fill-current" />
        </button>
        <button
          type="button"
          onClick={handleShareInstagram}
          title="Share on Instagram"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          {copiedInsta ? (
            <Check className="size-4" />
          ) : (
            <InstagramIcon className="size-4 fill-current" />
          )}
        </button>
        <button
          type="button"
          onClick={handleShareWhatsapp}
          title="Share on WhatsApp"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <WhatsappIcon className="size-4 fill-current" />
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy Link"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          {copiedLink ? (
            <Check className="size-4 text-[#382E07]" />
          ) : (
            <LinkIcon className="size-4 text-[#382E07]" />
          )}
        </button>
      </div>
    </div>
  );
}
