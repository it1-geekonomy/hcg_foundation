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
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
          aria-label="Close video"
        >
          <X className="size-6" />
        </button>
        <iframe
          src={`${videoUrl}?autoplay=1`}
          title="Patient Testimonial Video"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
