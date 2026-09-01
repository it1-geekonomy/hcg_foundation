"use client";

import Typography from "@/lib/Typography";

export default function DonateButton() {
  const scrollToDonateForm = () => {
    document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToDonateForm}
      className="fixed right-0 top-1/2 z-40 flex w-fit -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-l-md bg-[#FDC61D] p-1.5 shadow-lg transition hover:bg-[#e8b719] [writing-mode:vertical-rl] sm:rounded-l-lg sm:p-2 md:gap-2 md:p-3 lg:p-4"
    >
      <Typography variant="button-1" as="span" className="rotate-180 text-white">
        Donate Now
      </Typography>
    </button>
  );
}