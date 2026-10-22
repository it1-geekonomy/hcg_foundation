"use client";

import { useEffect } from "react";

export default function EventDetailClient() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    sessionStorage.setItem("came_from_details", "events");
  }, []);

  return null;
}
