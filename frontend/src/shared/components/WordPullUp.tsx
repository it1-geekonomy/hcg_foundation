"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WordPullUpProps {
  text: string;
  delay?: number; // Delay in milliseconds before starting (e.g. 150)
  stagger?: number; // Stagger in milliseconds between words (e.g. 40)
  className?: string;
  trigger?: boolean; // Controlled trigger state (e.g. isFlipped)
  as?: keyof React.JSX.IntrinsicElements;
}

export function WordPullUp({
  text,
  delay = 150,
  stagger = 40,
  className = "",
  trigger = true,
  as: Component = "h2",
}: WordPullUpProps) {
  const delaySec = delay / 1000;
  const staggerSec = stagger / 1000;
  const words = text.split(" ");

  return (
    <Component className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="inline-block overflow-hidden align-top leading-tight">
            <motion.span
              className="inline-block"
              initial={{ y: "115%", opacity: 0 }}
              animate={
                trigger
                  ? { y: "0%", opacity: 1 }
                  : { y: "115%", opacity: 0 }
              }
              transition={{
                duration: 0.48,
                ease: [0.16, 1, 0.3, 1], // Smooth editorial cubic-bezier
                delay: trigger ? delaySec + i * staggerSec : 0,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </Component>
  );
}

export default WordPullUp;
