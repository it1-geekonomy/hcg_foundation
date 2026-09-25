import React from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";

const ART_GALLERY_CARDS = [
  {
    icon: "/Resources/fi_1756784.png",
    title: "Showcase Art",
    description: "Exhibiting quality art pieces from emerging and established artists.",
  },
  {
    icon: "/Resources/Vector (8).png",
    title: "Create Awareness",
    description: "Using art as a medium to spread positivity and hope within the hospital community.",
  },
  {
    icon: "/Resources/Vector (9).png",
    title: "Support a Cause",
    description: "All proceeds help support cancer patients and Foundation initiatives.",
  },
  {
    icon: "/Resources/Vector (10).png",
    title: "Encourage Talent",
    description: "A platform for both up-and-coming and senior artists from across India and abroad.",
  },
];

export default function SwasthiArtTherapySection() {
  return (
    <div className="mt-[2.5rem] sm:mt-[3.5rem] lg:mt-[4.5rem] flex flex-col space-y-[2rem] sm:space-y-[2.5rem]">
      {/* Main Section Title */}
      <div>
        <Typography
          variant="heading-2"
          as="h2"
          className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
        >
          Swasthi Art Gallery & Art Therapy Program
        </Typography>
      </div>

      {/* Intro Paragraph */}
      <div>
        <Typography
          variant="body-10"
          as="p"
          className="font-argestadisplay font-normal text-justify text-[#596D79]"
        >
          Swasthi Art Gallery is HCG Foundation's creative care initiative where art supports patients through their cancer journey. Located within HCG's headquarters at Tower 1, Bengaluru, Swasthi Gallery brings together two connected efforts: a contemporary art gallery that channels the power of art into funding cancer care, and a dedicated Art Therapy program that brings the healing process of art-making directly to patients.
        </Typography>
      </div>

      {/* About Swasthi Gallery Sub-section */}
      <div className="flex flex-col space-y-[1rem]">
        <div>
          <Typography
            variant="heading-8"
            as="h3"
            className="font-argestadisplay font-normal underline text-[#262626]"
          >
            About Swasthi Gallery
          </Typography>
        </div>

        <Typography
          variant="body-10"
          as="p"
          className="font-argestadisplay font-normal text-justify text-[#596D79]"
        >
          Launched in 2007, the art space in a hospital gives a positive energy to the patients and their families. Swasthi Art Gallery has been actively involved in organizing art shows, camps and workshops which involve artists coming from across the country and outside.
        </Typography>

        <Typography
          variant="body-10"
          as="p"
          className="font-argestadisplay font-normal text-justify text-[#596D79]"
        >
          The gallery offers a platform to bring forth young upcoming artists and also organizes shows for renowned artists. Swasthi aspires to create a space for art lovers and buyers by exhibiting quality art pieces. They aim at raising funds for the HCG foundation to help support the cancer patients.
        </Typography>
      </div>

      {/* Side-by-side Section: Narrative + 2x2 Feature Box */}
      <div className="flex flex-col xl:flex-row gap-[2.5rem] xl:gap-[3rem] items-start pt-[0.5rem]">
        {/* Left Side: Art Therapy: Healing Through Creative Process */}
        <div className="w-full xl:flex-1 flex flex-col space-y-[1.25rem]">
          <div>
            <Typography
              variant="heading-8"
              as="h3"
              className="font-argestadisplay font-normal underline text-[#262626]"
            >
              Art Therapy: Healing Through the Creative Process
            </Typography>
          </div>

          <Typography
            variant="body-10"
            as="p"
            className="font-argestadisplay font-normal text-justify text-[#596D79]"
          >
            In 2018, Swasthi Art Gallery extended its mission from the gallery walls to direct patient care with the launch of its Art Therapy program at HCG Bangalore hospital. Art therapy is a form of expressive therapy that uses the creative process of making art to support a patient's physical, mental, and emotional wellbeing.
          </Typography>

          <div className="w-full max-w-[48rem] flex flex-col space-y-[1rem]">
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              Every session is built around the individual. A typical session unfolds in three parts:
            </Typography>

            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              • <span className="font-normal text-[#262626]">Pre-art conversation</span> — the pre-art component is crucial, especially for the first meeting between the art therapist and the patient. This allows the therapist to get to know and assess the patient
            </Typography>

            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              • <span className="font-normal text-[#262626]">The creative process</span> — the second part is the actual creative process, or the making of a piece or pieces of art. The therapist may teach the patient some art techniques, but the most important thing is to simply create something...
            </Typography>

            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              • <span className="font-normal text-[#262626]">Post-art reflection</span> — Patient and therapist discuss the finished piece together, the patient is expected to talk about their feelings, what led them to create that art, how they felt while making the art and their thoughts post completing it.
            </Typography>
          </div>
        </div>

        {/* Right Side: 2x2 Feature Box (Figma Rectangle 1673: 762px x 597px) */}
        <div className="w-full max-w-[47.625rem] xl:w-[47.625rem] h-auto sm:h-[37.3125rem] shrink-0 mx-auto xl:mx-0">
          <div className="w-full h-full rounded-[0.375rem] border border-[#FFECC5] bg-gradient-to-b from-[#FFFBEE] to-[#FEF3D3] p-[1.5rem] sm:p-[2.5rem] xl:p-[3rem] grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 relative">
            {/* Center Vertical Divider (Figma Line 21: 506.0742px x 0.6px, fading to 0% opacity at both ends) */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%-4rem)] max-h-[31.6296rem] w-[0.0625rem] z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
              }}
            />

            {/* Center Horizontal Divider (Figma Line 22: 423px x 0.6px, fading to 0% opacity at both ends) */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-4rem)] max-w-[26.4375rem] h-[0.0625rem] z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
              }}
            />

            {ART_GALLERY_CARDS.map((card, index) => {
              const isFirstRow = index < 2;
              const isFirstCol = index % 2 === 0;

              return (
                <React.Fragment key={card.title}>
                  <div
                    className={`flex flex-col justify-center ${
                      isFirstCol ? "sm:pr-[2rem] xl:pr-[2.5rem]" : "sm:pl-[2rem] xl:pl-[2.5rem]"
                    } ${
                      isFirstRow ? "sm:pb-[2rem] xl:pb-[2.5rem]" : "sm:pt-[2rem] xl:pt-[2.5rem]"
                    } py-4 sm:py-0`}
                  >
                    {/* Icon Circle (Figma Frame 594: 81px x 81px, radius 40.5px, padding 19px, #F0DEB8) */}
                    <div className="w-[5.0625rem] h-[5.0625rem] rounded-full bg-[#F0DEB8] flex items-center justify-center shrink-0">
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={43}
                        height={43}
                        className="w-[2.6875rem] h-[2.6875rem] object-contain"
                      />
                    </div>

                    {/* Card Title (16px / 1rem gap from circle) */}
                    <div className="mt-[1rem]">
                      <Typography
                        variant="heading-8"
                        as="h4"
                        className="font-argestadisplay font-normal text-left text-[#000000]"
                      >
                        {card.title}
                      </Typography>
                    </div>

                    {/* Card Description */}
                    <div className="mt-[0.5rem] max-w-[18.5625rem]">
                      <Typography
                        variant="body-7"
                        as="p"
                        className="font-manrope font-medium text-left text-[#606060]"
                      >
                        {card.description}
                      </Typography>
                    </div>
                  </div>

                  {/* Mobile Fading Divider (Vanishing to 0% at left and right edges) */}
                  {index !== ART_GALLERY_CARDS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="sm:hidden w-full max-w-[18rem] mx-auto h-[0.0625rem] my-[0.75rem]"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(133, 125, 106, 0) 0%, rgba(184, 172, 147, 0.715) 50%, rgba(133, 125, 106, 0) 100%)",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Closing Paragraphs */}
      <div className="flex flex-col space-y-[1.25rem] pt-[0.5rem]">
        <Typography
          variant="body-10"
          as="p"
          className="font-argestadisplay font-normal text-justify text-[#596D79]"
        >
          Sessions can be individual, group, or family-based allowing patients to process their experience alongside fellow patients navigating the same journey, always with the choice to share only what feels comfortable.
        </Typography>

        <Typography
          variant="body-10"
          as="p"
          className="font-argestadisplay font-normal text-justify text-[#596D79]"
        >
          Together, Swasthi Gallery and Art Therapy reflect HCG Foundation's belief that cancer care extends beyond medicine. One raises the funds that make patient support possible; the other puts the healing power of art directly into patients' hands.
        </Typography>
      </div>
    </div>
  );
}
