"use client";

import React from "react";
import { CONTACT_INFO } from "@/domains/contact/constants/contact";
import Typography from "@/lib/Typography";
import { ContactIcon, ContactRow } from "./contactIconAnimation";

const TypographyField = Typography as unknown as React.ComponentType<
  Record<string, unknown>
>;

const PHONE_TITLE = /phone|mobile|call|helpline|contact number/i;
const PHONE_LINE = /^\+?[\d\s()\-.]{7,}$/;

/* "+91 98765 43210" -> "tel:+919876543210" (keeps a leading +) */
const toTelHref = (line: string) =>
  `tel:${line.trim().startsWith("+") ? "+" : ""}${line.replace(/\D/g, "")}`;

export default function ContactInfoSection() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:col-span-4 w-full lg:h-full">
      {CONTACT_INFO.map((item, index) => {
        const isEmail = item.title.toLowerCase() === "email";
        const emailAddress = isEmail ? item.lines.join("") : "";
        const isPhone =
          !isEmail &&
          (PHONE_TITLE.test(item.title) ||
            item.lines.every((line) => PHONE_LINE.test(line.trim())));

        return (
          <ContactRow
            key={index}
            className="flex items-start gap-3 sm:gap-4 lg:gap-5"
          >
            <ContactIcon
              src={item.icon}
              alt={item.title}
              index={index}
              total={CONTACT_INFO.length}
            />

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
              ) : isPhone ? (
                /* Tap a number on mobile -> opens the dialpad */
                <div className="flex flex-col gap-0.5">
                  {item.lines.map((line, lineIndex) =>
                    PHONE_LINE.test(line.trim()) ? (
                      <TypographyField
                        key={lineIndex}
                        variant="body-3"
                        as="a"
                        href={toTelHref(line)}
                        className="font-manrope font-normal text-left text-[#0D2838]/52 hover:text-[#0D2838]/80 hover:underline transition"
                      >
                        {line}
                      </TypographyField>
                    ) : (
                      <Typography
                        key={lineIndex}
                        variant="body-3"
                        as="p"
                        className="font-manrope font-normal text-left text-[#0D2838]/52"
                      >
                        {line}
                      </Typography>
                    )
                  )}
                </div>
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
          </ContactRow>
        );
      })}
    </div>
  );
}