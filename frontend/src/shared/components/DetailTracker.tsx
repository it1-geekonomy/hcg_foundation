"use client";

import { useEffect } from "react";

export function DetailTracker({ type }: { type: string }) {
  useEffect(() => {
    sessionStorage.setItem("came_from_details", type);
  }, [type]);

  return null;
}
