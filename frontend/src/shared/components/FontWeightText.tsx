"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FontWeightTextProps {
  text: string;
  className?: string;
  fontSize?: number;
  delayMultiplier?: number;
}

export function FontWeightText({
  text,
  className = "",
  fontSize,
  delayMultiplier = 0.14,
}: FontWeightTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll<HTMLElement>(".weight-char");

    chars.forEach((span, i) => {
      span.style.animationDelay = `${i * delayMultiplier}s`;
    });
  }, [text, delayMultiplier]);

  const words = text.split(" ");
  let globalCharCount = 0;

  return (
    <span
      ref={containerRef}
      aria-label={text}
      className={cn("inline-flex flex-wrap items-center font-sans", className)}
      style={{
        fontSize: fontSize ? `${fontSize}px` : undefined,
      }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            const charIdx = globalCharCount++;
            const delay = `${charIdx * delayMultiplier}s`;

            return (
              <span
                key={charIdx}
                className="weight-char inline-block animate-breath [animation-fill-mode:both]"
                aria-hidden="true"
                style={{ animationDelay: delay }}
              >
                {char}
              </span>
            );
          })}
          {wordIdx < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}

export default FontWeightText;
