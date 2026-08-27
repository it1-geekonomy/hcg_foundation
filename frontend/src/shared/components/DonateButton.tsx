import Typography from "@/lib/Typography";

export default function DonateButton() {
  return (
    <button
      type="button"
      className="fixed right-0 top-1/2 z-40 flex w-fit -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-l-md bg-[#FDC61D] p-1.5 font-semibold uppercase tracking-[0.1em] text-stone-900 shadow-lg transition hover:bg-[#e8b719] [writing-mode:vertical-rl] sm:rounded-l-lg sm:p-2 sm:tracking-[0.12em] md:gap-2 md:p-3 md:tracking-[0.16em] lg:p-4 lg:tracking-[0.2em]"
    >
      <Typography
        variant="body"
        as="span"
        className="rotate-180 font-manrope font-bold text-white"
      >
        Donate Now
      </Typography>
    </button>
  );
}