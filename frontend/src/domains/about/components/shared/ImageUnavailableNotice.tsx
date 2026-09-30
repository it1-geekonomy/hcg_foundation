import Typography from "@/lib/Typography";

/** Shared empty/broken image state for About Us cards. */
export function ImageUnavailableNotice() {
  return (
    <div className="flex size-full items-center justify-center bg-[#FFF8F0] p-4">
      <Typography
        variant="caption-1"
        as="p"
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-red-700"
      >
        Image not available
      </Typography>
    </div>
  );
}
