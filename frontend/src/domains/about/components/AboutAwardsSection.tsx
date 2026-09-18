"use client";

import { useEffect, useState } from "react";
import { publicAwardsApi } from "@/domains/cms/lib/api";
import AwardsRecognition from "@/domains/about/components/awards";
import {
  mapCmsAwardToItem,
  type AwardItem,
} from "@/domains/about/constants/awards";
import Typography from "@/lib/Typography";

/**
 * About Us awards block — loads published awards from CMS only.
 * No static / dummy awards or photos.
 */
export default function AboutAwardsSection() {
  const [items, setItems] = useState<AwardItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await publicAwardsApi.listPublished({ limit: 50 });
        if (cancelled) return;
        setItems((res.data ?? []).map(mapCmsAwardToItem));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error ? err.message : "Unable to load awards",
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <section className="bg-[#FFFCF2] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <div className="mx-auto h-[420px] max-w-[1260px] animate-pulse rounded-2xl bg-[#FFE9A8]/40" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FFFCF2] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <Typography
          variant="label-1"
          as="div"
          className="mx-auto max-w-[1260px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error}
        </Typography>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-[#FFFCF2] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <Typography
          variant="label-1"
          as="div"
          className="mx-auto max-w-[1260px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
        >
          No published awards yet. Add them in CMS with status published.
        </Typography>
      </section>
    );
  }

  return <AwardsRecognition items={items} />;
}
