import React from "react";
import Typography from "@/lib/Typography";
import ShareStory from "@/shared/components/ShareStory";
import PuzzleImage from "@/shared/components/Puzzleimage";
import type { ProjectItem } from "@/domains/resources/constants/projects";

export function ProjectDetailPreview({ project }: { project: ProjectItem }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start">
      {/* Left Column: Story Details (7 cols) */}
      <div className="sm:col-span-7 flex flex-col">
        <Typography
          variant="heading-2"
          as="h1"
          className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
        >
          {project.title}
        </Typography>

        {/* Story Paragraphs */}
        <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
          {project.fullStory.includes("<") ? (
            <div
              className="prose max-w-none text-left font-argestadisplay font-normal text-justify text-[#596D79] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#596D79] [&_span]:!text-[#596D79] [&_div]:!text-[#596D79] [&_strong]:!text-[#596D79] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#596D79] [&_td]:!text-[#596D79] [&_th]:!text-[#0D2838]"
              dangerouslySetInnerHTML={{ __html: project.fullStory }}
            />
          ) : (
            <div className="space-y-4 text-left">
              {project.fullStory.split("\n\n").map((paragraph, index) => (
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
        </div>

        {/* Reusable Social Share Buttons */}
        <ShareStory />
      </div>

      {/* Right Column: Featured Image (5 cols) */}
      <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
        <div className="relative aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl">
          {/* Puzzle-piece reveal on the detail image only */}
          {project.imageUrl ? (
            <PuzzleImage
              key={project.id}
              src={project.imageUrl}
              alt={project.title}
              rows={4}
              cols={5}
              fit="cover"
              staggerDuration={1000}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
