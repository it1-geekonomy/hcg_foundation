import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";
import { detailMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const res = await publicPatientStoriesApi.getBySlug(id).catch(() => null);
  const item = res?.data?.detail;
  return detailMetadata({
    section: "/patient-stories",
    sectionLabel: "Patient Stories",
    id,
    item,
    image: item?.patientImage,
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
