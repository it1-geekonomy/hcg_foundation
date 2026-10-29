import * as flags from "country-flag-icons/string/3x2";

/** Serves `/flags/IN.svg` from the country-flag-icons package so the flag SVGs never enter the client bundle. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const key = code.replace(/\.svg$/i, "").toUpperCase();
  const svg = (flags as Record<string, string>)[key];

  if (!svg) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
