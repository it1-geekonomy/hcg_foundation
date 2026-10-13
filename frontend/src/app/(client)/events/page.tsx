import React from "react";
import DonateForm from "@/shared/components/DonateForm";
import EventsListSection from "@/domains/resources/components/EventsListSection";
import Banner from "@/domains/resources/events/components/bannersection";
import { publicEventsApi } from "@/domains/cms/lib/api";
import { EventItem } from "@/domains/resources/components/EventCard";

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageParam = parseInt(resolvedParams.page || "1", 10);
  const initialPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let initialEvents: EventItem[] | null = null;
  let initialTotalCount: number | null = null;

  try {
    const res = await publicEventsApi.listPublished({
      page: initialPage,
      limit: 6,
    });

    if (res?.data && res.data.length > 0) {
      initialEvents = res.data.map((e) => ({
        id: e.id ?? "",
        slug: e.slug ?? "",
        title: e.title ?? "",
        date: e.eventDate
          ? new Date(e.eventDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
        category: "Community Event",
        summary: e.shortDescription ?? "",
        fullStory: e.content ?? "",
        imageUrl: e.eventBanner || e.eventMobileBanner || "",
        mobileImageUrl: e.eventMobileBanner || e.eventBanner || "",
        location: e.eventLocation ?? "",
      }));
      initialTotalCount = res.meta?.total ?? initialEvents.length;
    } else {
      initialEvents = [];
      initialTotalCount = 0;
    }
  } catch {
    initialEvents = null;
    initialTotalCount = null;
  }

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner />
      <EventsListSection
        initialEvents={initialEvents}
        initialTotalCount={initialTotalCount}
        initialPage={initialPage}
      />

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
