"use client";

import React from "react";
import { Link as LinkIcon } from "lucide-react";
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
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
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
          title="Share on Facebook"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <FacebookIcon className="size-4 fill-current" />
        </button>
        <button
          type="button"
          title="Share on Instagram"
          className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
        >
          <InstagramIcon className="size-4 fill-current" />
        </button>
        <button
          type="button"
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
          <LinkIcon className="size-4 text-[#382E07]" />
        </button>
      </div>
    </div>
  );
}
