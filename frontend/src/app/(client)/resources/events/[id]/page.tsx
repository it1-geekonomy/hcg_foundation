"use client";

import React, { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import ShareStory from "@/shared/components/ShareStory";
import RelatedEvents from "@/domains/resources/components/RelatedEvents";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const [eventItem, setEventItem] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicEventsApi.getBySlug(resolvedParams.id);
        const e = res.data?.detail;
        if (!cancelled && e) {
          setEventItem({
            id: e.id ?? "",
            slug: e.slug ?? "",
            title: e.title ?? "",
            date: e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Community Event" as const,
            summary: e.shortDescription ?? "",
            fullStory: e.content ?? "",
            imageUrl: e.eventBanner || e.eventMobileBanner || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
            location: e.eventLocation ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) setEventItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  if (!loading && !eventItem) {
    notFound();
  }

  useEffect(() => {
    sessionStorage.setItem("came_from_details", "events");
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/#events" },
          { label: "Resources" },
          { label: "Events" },
        ]}
        title="Events"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {loading || !eventItem ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start animate-pulse">
            <div className="sm:col-span-7 flex flex-col space-y-4">
              <div className="h-10 bg-black/10 rounded w-3/4"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-5/6"></div>
            </div>
            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-black/10 shadow-md"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start">
            {/* Left Column: Story Details (7 cols) */}
            <div className="sm:col-span-7 flex flex-col">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
              >
                {eventItem.title}
              </Typography>

              {/* Metadata: Date and Location matching Figma Frame 36 */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="size-4 text-[#C08600] shrink-0" />
                  <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                    {eventItem.date}
                  </Typography>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="size-4 text-[#C08600] shrink-0" />
                  <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                    {eventItem.location || "Bangalore"}
                  </Typography>
                </div>
              </div>

              {/* Story Paragraphs */}
              {eventItem.fullStory.includes("<") ? (
                <div
                  className="mt-5 sm:mt-6 prose max-w-none text-left font-argestadisplay font-normal text-justify text-[#596D79] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#596D79] [&_span]:!text-[#596D79] [&_div]:!text-[#596D79] [&_strong]:!text-[#596D79] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#596D79] [&_td]:!text-[#596D79] [&_th]:!text-[#0D2838]"
                  dangerouslySetInnerHTML={{ __html: eventItem.fullStory }}
                />
              ) : (
                <div className="mt-5 sm:mt-6 space-y-4 text-left">
                  {eventItem.fullStory.split("\n\n").map((paragraph, index) => (
                    <Typography
                      key={index}
                      variant="body-10"
                      as="p"
                      className="font-argestadisplay font-normal text-justify text-[#596D79]"
                    >
                      {paragraph}
                    </Typography>
                  ))}
                </div>
              )}

              {/* Reusable Social Share Buttons */}
              <ShareStory />
            </div>

            {/* Right Column: Featured Image (5 cols) */}
            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-[#EFEAD8] shadow-md">
                <img
                  src={eventItem.imageUrl}
                  alt={eventItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Reusable Related Events Section */}
      {eventItem && <RelatedEvents currentEventId={eventItem.id} />}

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
