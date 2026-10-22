"use client";

import { useEffect } from "react";
import { useDetailPageAnimations } from "@/shared/lib/detailPageAnimations";
import { PROJECT_FROM_HOME_KEY } from "@/domains/home/constants/project";

export default function ProjectDetailClient({ id }: { id?: string }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (sessionStorage.getItem(PROJECT_FROM_HOME_KEY)) {
      sessionStorage.removeItem(PROJECT_FROM_HOME_KEY);
      window.history.replaceState({ ...window.history.state, [PROJECT_FROM_HOME_KEY]: true }, "");
    }
    const fromHome = Boolean(window.history.state?.[PROJECT_FROM_HOME_KEY]);
    if (fromHome) {
      sessionStorage.setItem("came_from_details", "projects");
    }
  }, []);

  useDetailPageAnimations(true, id);

  return null;
}
