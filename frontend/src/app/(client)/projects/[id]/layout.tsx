import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicProjectsApi } from "@/domains/cms/lib/api";
import { detailMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const res = await publicProjectsApi.getBySlug(id).catch(() => null);
  const item = res?.data?.detail;
  return detailMetadata({
    section: "/projects",
    sectionLabel: "Projects",
    id,
    item,
    image: item?.projectBanner || item?.projectMobileBanner,
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
