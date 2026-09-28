"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BounceProps {
  text: string;
  delay?: number; // Delay in milliseconds before starting (e.g. 200)
  stagger?: number; // Stagger interval in milliseconds between items (e.g. 60)
  by?: "word" | "character";
  className?: string;
  trigger?: boolean; // Controlled trigger state (e.g. isFlipped)
  as?: keyof React.JSX.IntrinsicElements;
}

export function Bounce({
  text,
  delay = 200,
  stagger = 60,
  by = "word",
  className = "",
  trigger = true,
  as: Component = "span",
}: BounceProps) {
  const delaySec = delay / 1000;
  const staggerSec = stagger / 1000;

  const elements = by === "character" ? text.split("") : text.split(" ");

  return (
    <Component className={cn("inline-block", className)}>
      {elements.map((item, index) => (
        <React.Fragment key={index}>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 16, scale: 0.88 }}
            animate={
              trigger
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }
                : { opacity: 0, y: 16, scale: 0.88 }
            }
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 260,
              bounce: 0.5,
              delay: trigger ? delaySec + index * staggerSec : 0,
            }}
          >
            {item === " " && by === "character" ? "\u00A0" : item}
          </motion.span>
          {by === "word" && index < elements.length - 1 && " "}
        </React.Fragment>
      ))}
    </Component>
  );
}

export default Bounce;
