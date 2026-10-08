"use client";

import { useEffect, useRef } from "react";
import { PROJECT_FROM_HOME_KEY } from "@/domains/home/constants/project";

export default function ProjectTracker() {
  const fromHome = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(PROJECT_FROM_HOME_KEY)) {
      sessionStorage.removeItem(PROJECT_FROM_HOME_KEY);
      window.history.replaceState({ ...window.history.state, [PROJECT_FROM_HOME_KEY]: true }, "");
    }
    fromHome.current = Boolean(window.history.state?.[PROJECT_FROM_HOME_KEY]);
    if (fromHome.current) {
      sessionStorage.setItem("came_from_details", "projects");
    }
  }, []);

  return null;
}
