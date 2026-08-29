import Typography from "@/lib/Typography";

export default function DonateButton() {
  return (
    <button
      type="button"
      className="fixed right-0 top-1/2 z-40 flex w-fit -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-l-md bg-[#FDC61D] p-1.5 shadow-lg transition hover:bg-[#e8b719] [writing-mode:vertical-rl] sm:rounded-l-lg sm:p-2 md:gap-2 md:p-3 lg:p-4"
    >
      <Typography variant="button-2" as="span" className="rotate-180 text-black">
        Donate Now
      </Typography>
    </button>
  );
}
