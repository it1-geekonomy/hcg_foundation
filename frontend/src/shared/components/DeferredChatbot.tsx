"use client";

import { useEffect, useState } from "react";
import type ChatbotWidget from "./ChatbotWidget";

/** The launcher is not part of the first screen, so its script waits for a scroll or tap. */
export default function DeferredChatbot() {
  const [Widget, setWidget] = useState<typeof ChatbotWidget | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      void import("./ChatbotWidget").then((mod) => {
        if (!cancelled) setWidget(() => mod.default);
      });
    };

    window.addEventListener("scroll", load, { passive: true, once: true });
    window.addEventListener("pointerdown", load, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", load);
      window.removeEventListener("pointerdown", load);
    };
  }, []);

  if (!Widget) return null;
  return <Widget />;
}
