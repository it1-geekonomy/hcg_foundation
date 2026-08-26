import Typography from "@/lib/Typography";

export default function DonateButton() {
  return (
    <button
      type="button"
      className="fixed right-0 top-1/2 z-40 flex w-fit -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-l-lg bg-[#FDC61D] p-2 font-semibold uppercase tracking-[0.12em] text-stone-900 shadow-lg transition hover:bg-[#e8b719] md:gap-2 md:p-4 md:tracking-[0.2em]"
      style={{ writingMode: "vertical-rl" }}
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
