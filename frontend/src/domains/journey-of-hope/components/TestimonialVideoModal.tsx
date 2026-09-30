"use client";

import React from "react";
import { X } from "lucide-react";

interface TestimonialVideoModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export default function TestimonialVideoModal({
  videoUrl,
  onClose,
}: TestimonialVideoModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (videoUrl) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoUrl, onClose]);

  if (!videoUrl) return null;

  const isMp4 = videoUrl.endsWith(".mp4") || videoUrl.includes(".mp4");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm">
      {/* Click on backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Content with Close Button Outside Video */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-end">
        {/* Prominent Close / Cut Button positioned outside above the video */}
        <button
          onClick={onClose}
          className="mb-2 sm:mb-3 flex size-10 sm:size-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition duration-200 cursor-pointer shadow-lg border border-white/20"
          aria-label="Close video"
        >
          <X className="size-6 sm:size-7" />
        </button>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl border border-white/10">
          {isMp4 ? (
            <video
              src={videoUrl}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={`${videoUrl}?autoplay=1`}
              title="Patient Testimonial Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}
