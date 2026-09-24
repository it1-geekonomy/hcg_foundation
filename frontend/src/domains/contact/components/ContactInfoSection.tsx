"use client";

import React from "react";
import { CONTACT_INFO } from "@/domains/contact/constants/contact";
import Typography from "@/lib/Typography";

const TypographyField = Typography as unknown as React.ComponentType<
  Record<string, unknown>
>;

export default function ContactInfoSection() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:col-span-4 w-full lg:h-full">
      {CONTACT_INFO.map((item, index) => {
        const isEmail = item.title.toLowerCase() === "email";
        const emailAddress = isEmail ? item.lines.join("") : "";

        return (
          <div key={index} className="flex items-start gap-3 sm:gap-4 lg:gap-5">
            <div className="flex size-10 sm:size-12 lg:size-16 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D]">
              <img
                src={item.icon}
                alt={item.title}
                className="size-4 sm:size-5 lg:size-7"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Typography
                variant="body-2"
                as="span"
                className="font-argestadisplay font-normal text-left text-[#0D2838]"
              >
                {item.title}
              </Typography>

              {isEmail ? (
                <TypographyField
                  variant="body-3"
                  as="a"
                  href={`mailto:${emailAddress}`}
                  className="font-manrope font-normal text-left text-[#0D2838]/52 hover:text-[#0D2838]/80 hover:underline transition"
                >
                  {emailAddress}
                </TypographyField>
              ) : (
                <Typography
                  variant="body-3"
                  as="p"
                  className="font-manrope font-normal text-left text-[#0D2838]/52"
                >
                  {/* Below 400px: natural wrap, no forced breaks */}
                  <span className="min-[400px]:hidden">
                    {item.lines.join(" ")}
                  </span>
                  {/* 400px to lg: fixed line breaks */}
                  <span className="hidden min-[400px]:inline lg:hidden">
                    {item.lines.map((line, lineIndex) => (
                      <React.Fragment key={lineIndex}>
                        {lineIndex > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                  </span>
                  {/* lg and above: natural wrap, no forced breaks */}
                  <span className="hidden lg:inline">
                    {item.lines.join(" ")}
                  </span>
                </Typography>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}