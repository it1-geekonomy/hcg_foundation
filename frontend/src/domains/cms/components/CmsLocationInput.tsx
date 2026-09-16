"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";

type PlaceSuggestion = {
  id: string;
  label: string;
};

type CmsLocationInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                componentRestrictions?: { country: string | string[] };
              },
              callback: (
                predictions:
                  | Array<{ description: string; place_id: string }>
                  | null,
                status: string
              ) => void
            ) => void;
          };
        };
      };
    };
    __hcgGoogleMapsPromise?: Promise<void>;
  }
}

function loadGooglePlaces(): Promise<void> {
  if (!GOOGLE_KEY) return Promise.reject(new Error("Missing Google Maps key"));
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__hcgGoogleMapsPromise) return window.__hcgGoogleMapsPromise;

  window.__hcgGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-hcg-google-maps="1"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_KEY)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.hcgGoogleMaps = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return window.__hcgGoogleMapsPromise;
}

async function searchGoogle(query: string): Promise<PlaceSuggestion[]> {
  await loadGooglePlaces();
  const service = new window.google!.maps!.places!.AutocompleteService();
  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (status !== "OK" || !predictions?.length) {
          resolve([]);
          return;
        }
        resolve(
          predictions.map((p) => ({
            id: p.place_id,
            label: p.description,
          }))
        );
      }
    );
  });
}

/** Free place autocomplete, India only (no API key). */
async function searchPhoton(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("lang", "en");
  // Bias toward India
  url.searchParams.set("lat", "22.0");
  url.searchParams.set("lon", "79.0");
  // India approximate bbox: minLon,minLat,maxLon,maxLat
  url.searchParams.set("bbox", "68.1,6.5,97.4,35.7");

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = (await res.json()) as {
    features?: Array<{
      properties?: {
        osm_id?: number | string;
        name?: string;
        street?: string;
        housenumber?: string;
        city?: string;
        state?: string;
        country?: string;
        countrycode?: string;
        postcode?: string;
      };
    }>;
  };

  return (data.features ?? [])
    .map((feature, index) => {
      const p = feature.properties ?? {};
      const countryCode = (p.countrycode ?? "").toUpperCase();
      const country = (p.country ?? "").toLowerCase();
      const isIndia =
        countryCode === "IN" ||
        country === "india" ||
        country.includes("india");
      if (!isIndia) return null;

      const parts = [
        [p.name, p.housenumber].filter(Boolean).join(" "),
        p.street,
        p.city,
        p.state,
        "India",
      ]
        .map((part) => part?.trim())
        .filter(Boolean) as string[];

      const label = parts.join(", ");
      if (!label) return null;

      return {
        id: String(p.osm_id ?? `${label}-${index}`),
        label,
      };
    })
    .filter((item): item is PlaceSuggestion => Boolean(item))
    .slice(0, 7);
}

async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (GOOGLE_KEY) {
    try {
      const googleResults = await searchGoogle(query);
      if (googleResults.length) return googleResults;
    } catch {
      // fall through to Photon
    }
  }
  return searchPhoton(query);
}

export default function CmsLocationInput({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Search an Indian place…",
  className,
}: CmsLocationInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searched, setSearched] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      const idNow = ++requestId.current;
      setLoading(true);
      try {
        const results = await searchPlaces(q);
        if (idNow !== requestId.current) return;
        setSuggestions(results);
        setActiveIndex(results.length ? 0 : -1);
        setSearched(true);
        setOpen(true);
      } catch {
        if (idNow !== requestId.current) return;
        setSuggestions([]);
        setSearched(true);
      } finally {
        if (idNow === requestId.current) setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const pick = (label: string) => {
    onChange(label);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setSearched(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8A8A8A]" />
        <Input
          id={inputId}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="h-9 bg-white pr-9 pl-8"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open || !suggestions.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex(
                (i) => (i - 1 + suggestions.length) % suggestions.length
              );
            } else if (e.key === "Enter" && activeIndex >= 0) {
              e.preventDefault();
              pick(suggestions[activeIndex].label);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin text-[#8A8A8A]" />
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-50 max-h-64 w-full overflow-y-auto rounded-xl bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
        >
          {suggestions.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left font-manrope text-sm transition",
                  index === activeIndex
                    ? "bg-[#FFF6E8] text-[#212121]"
                    : "text-[#3A3A3A] hover:bg-[#F7F7F5]"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(item.label)}
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#C45A7A]" />
                <span className="leading-snug">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open &&
      searched &&
      !loading &&
      value.trim().length >= 2 &&
      suggestions.length === 0 ? (
        <p className="mt-1.5 font-manrope text-[11px] text-[#8A8A8A]">
          No places found — you can still save this as a custom location.
        </p>
      ) : null}
    </div>
  );
}
