"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import ShareStory from "@/shared/components/ShareStory";
import RelatedEvents from "@/domains/resources/components/RelatedEvents";
import { EVENTS_DATA } from "@/domains/resources/constants/events";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const eventItem = EVENTS_DATA.find(
    (e) => e.id === resolvedParams.id || e.slug === resolvedParams.id
  );

  if (!eventItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
        title="Events"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
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
      </section>

      {/* Reusable Related Events Section */}
      <RelatedEvents currentEventId={eventItem.id} />

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
