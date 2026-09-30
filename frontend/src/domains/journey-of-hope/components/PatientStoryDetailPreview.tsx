import React from "react";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import ShareStory from "@/shared/components/ShareStory";
import { PatientStory } from "@/domains/journey-of-hope/constants/stories";

export function PatientStoryDetailPreview({ story }: { story: PatientStory }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start">
      {/* Left Column: Patient Image + Social Share Buttons */}
      <div className="sm:col-span-5 flex flex-col items-start w-full">
        <div className="relative aspect-[615/646] w-full max-w-[37.5rem] sm:max-w-[26.25rem] md:max-w-[30rem] lg:max-w-[32.5rem] xl:max-w-[35rem] overflow-hidden rounded-md bg-[#EFEAD8] shadow-xs">
          <img
            src={story.imageUrl}
            alt={story.patientName}
            className="h-full w-full object-cover"
          />
        </div>
        <ShareStory className="!mt-4 sm:!mt-6" />
      </div>

      {/* Right Column: Patient Name Title, Date, and Full Story Narrative */}
      <div className="sm:col-span-7 flex flex-col">
        <Typography
          variant="heading-2"
          as="h1"
          className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
        >
          {story.patientName}
        </Typography>

        {story.date ? (
          <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
            <Calendar className="size-4 text-[#C08600] shrink-0" />
            <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
              {story.date}
            </Typography>
          </div>
        ) : null}

        {/* Full Story HTML / Text Narrative */}
        <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
          {story.fullStory.includes("<") ? (
            <div
              className="prose prose-stone max-w-none text-justify text-[#343E43]"
              dangerouslySetInnerHTML={{ __html: story.fullStory }}
            />
          ) : (
            <div className="space-y-3.5 text-justify">
              {story.fullStory.split("\n\n").map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body-10"
                  as="p"
                  className="font-argestadisplay font-normal text-[#343E43]"
                >
                  {paragraph}
                </Typography>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
