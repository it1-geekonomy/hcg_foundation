import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicEventsApi } from "@/domains/cms/lib/api";
import { detailMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const res = await publicEventsApi.getBySlug(id).catch(() => null);
  const item = res?.data?.detail;
  return detailMetadata({
    section: "/events",
    sectionLabel: "Events",
    id,
    item,
    image: item?.eventBanner || item?.eventMobileBanner,
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
