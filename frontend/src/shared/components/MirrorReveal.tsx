"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MirrorRevealProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  delay?: number; // Delay in seconds before doors slide open
  duration?: number; // Duration of the door opening animation (slow and smooth)
}

export function MirrorReveal({
  children,
  isOpen,
  className = "",
  delay = 0,
  duration = 0.82,
}: MirrorRevealProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-[#FFF8E2]", className)}>
      {/* Revealed Content Behind the Doors */}
      <div className="relative h-full w-full z-10">
        {children}
      </div>

      {/* Left Sliding Door: Warm Cream Palette matching #FFF8E2 */}
      <motion.div
        aria-hidden="true"
        initial={{ x: "0%" }}
        animate={{ x: isOpen ? "-102%" : "0%" }}
        transition={{
          duration: isOpen ? duration : 0.01,
          delay: isOpen ? delay : 0.52,
          ease: isOpen ? [0.65, 0, 0.25, 1] : "linear",
        }}
        className="absolute top-0 bottom-0 left-0 w-1/2 z-30 pointer-events-none overflow-hidden border-r border-[#E0D4AE] shadow-md bg-gradient-to-r from-[#F5ECCB] via-[#FFF8E2] to-[#FFF6D8]"
      >
        {/* Subtle Light Reflection Stripe */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.7)_50%,transparent_70%)]" />
        {/* Seam Highlight Line */}
        <div className="absolute top-0 bottom-0 right-0 w-[1.5px] bg-[#E0D4AE]" />
      </motion.div>

      {/* Right Sliding Door: Warm Cream Palette matching #FFF8E2 */}
      <motion.div
        aria-hidden="true"
        initial={{ x: "0%" }}
        animate={{ x: isOpen ? "102%" : "0%" }}
        transition={{
          duration: isOpen ? duration : 0.01,
          delay: isOpen ? delay : 0.52,
          ease: isOpen ? [0.65, 0, 0.25, 1] : "linear",
        }}
        className="absolute top-0 bottom-0 right-0 w-1/2 z-30 pointer-events-none overflow-hidden border-l border-[#E0D4AE] shadow-md bg-gradient-to-l from-[#F5ECCB] via-[#FFF8E2] to-[#FFF6D8]"
      >
        {/* Subtle Light Reflection Stripe */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(65deg,transparent_30%,rgba(255,255,255,0.7)_50%,transparent_70%)]" />
        {/* Seam Highlight Line */}
        <div className="absolute top-0 bottom-0 left-0 w-[1.5px] bg-[#E0D4AE]" />
      </motion.div>
    </div>
  );
}

export default MirrorReveal;
