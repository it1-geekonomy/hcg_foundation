"use client";

import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";

export default function DonateButton() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = (e?: Event) => {
      const customEvent = e as CustomEvent<{ isVisible: boolean }> | undefined;
      if (customEvent?.detail && typeof customEvent.detail.isVisible === "boolean") {
        setIsNavbarVisible(customEvent.detail.isVisible);
      } else if (typeof document !== "undefined" && document.body.dataset.navbarVisible !== undefined) {
        setIsNavbarVisible(document.body.dataset.navbarVisible !== "false");
      }
    };

    // Initial check from dataset attribute
    syncVisibility();

    window.addEventListener("navbar_visibility_change", syncVisibility);
    return () => {
      window.removeEventListener("navbar_visibility_change", syncVisibility);
    };
  }, []);

  const scrollToDonateForm = () => {
    const el = document.getElementById("donate-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#donate-form";
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToDonateForm}
      aria-hidden={isNavbarVisible}
      tabIndex={isNavbarVisible ? -1 : 0}
      className={`fixed right-0 top-1/2 z-40 flex w-fit -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-l-md bg-[#FDC61D] p-1.5 [writing-mode:vertical-rl] sm:rounded-l-lg sm:p-2 md:gap-2 md:p-3 lg:p-4 cursor-pointer shadow-md transition-all duration-300 ease-in-out ${
        isNavbarVisible
          ? "translate-x-full opacity-0 pointer-events-none"
          : "translate-x-0 opacity-100 pointer-events-auto"
      }`}
    >
      <Typography variant="button-1" as="span" className="rotate-180 text-neutral-900">
        Donate Now
      </Typography>
    </button>
  );
}