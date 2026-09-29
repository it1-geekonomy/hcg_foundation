"use client";

import { useEffect, useRef, useState } from "react";

/* Gap between one step/arrow and the next in the sequence */
export const STAGGER_SECONDS = 0.14;

/* Watches ONE element (the whole section) and reports whether
   it has entered the viewport. Fires once on first entry, then
   stops observing, so scrolling back up/down does NOT replay. */
export function useSectionVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}