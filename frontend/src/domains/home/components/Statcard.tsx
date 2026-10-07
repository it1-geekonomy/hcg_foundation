"use client";

import { useEffect, useState } from "react";
import type { Stat } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";

const NETSCAPE = new TextEncoder().encode("NETSCAPE2.0");

function findBytes(haystack: Uint8Array, needle: Uint8Array) {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/** Drop the infinite-loop marker so the browser plays the gif once and holds the last frame. */
function playOnceGif(bytes: Uint8Array) {
  const idx = findBytes(bytes, NETSCAPE);
  const start = idx - 3;
  if (
    idx < 3 ||
    bytes[start] !== 0x21 ||
    bytes[start + 1] !== 0xff ||
    bytes[start + 2] !== 0x0b
  ) {
    return bytes;
  }

  const end = idx + NETSCAPE.length + 5;
  if (end > bytes.length || bytes[end - 1] !== 0x00) return bytes;

  const out = new Uint8Array(bytes.length - (end - start));
  out.set(bytes.subarray(0, start), 0);
  out.set(bytes.subarray(end), start);
  return out;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export default function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(stat.gif);
          const bytes = new Uint8Array(await response.arrayBuffer());
          const blob = new Blob([toArrayBuffer(playOnceGif(bytes))], { type: "image/gif" });
          objectUrl = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          setSrc(objectUrl);
        } catch {
          if (!cancelled) setSrc(stat.gif);
        }
      })();
    }, stat.delay * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [active, stat.delay, stat.gif]);

  return (
    <div
      className="flex flex-col items-center transition-all duration-700"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${stat.delay}s`,
      }}
    >
      <div className="relative h-40 w-[min(100%,144px)] sm:h-56 sm:w-[202px] lg:h-64">
        {src ? (
          // Blob URL of a single-play gif; next/image does not keep that playback.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={stat.label.replace("\n", " ")}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : null}
      </div>

      <Typography
        variant="body-4"
        as="p"
        className="whitespace-pre-line text-center text-black font-light"
      >
        {stat.label}
      </Typography>
    </div>
  );
}