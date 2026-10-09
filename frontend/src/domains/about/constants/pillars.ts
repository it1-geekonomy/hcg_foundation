import type { ReactNode } from "react";

export interface Pillar {
  /** Icon image path (from /public), e.g. "/whatwestandfor/heart.png" */
  icon: string;
  /** Card heading, e.g. "Patient Support" */
  title: ReactNode;
  /** Supporting description text */
  description: ReactNode;
}

export const pillars: Pillar[] = [
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835706307-np8n8-fi_10440027.webp",
    title: "Financial Assistance",
    description: "Making cancer treatment accessible to economically disadvantaged patients",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835680664-wbnx8-fi_6456121.webp",
    title: "Awareness & Education",
    description: "Education & awareness program for adolescents & communities to build cancer literacy and reduce stigma",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835648405-ekopz-fi_9484251.webp",
    title: "Screening & Early Detection",
    description: "Taking cancer awareness and early detection closer to needy communities through camps",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835737630-bdaco-fi_2163406.webp",
    title: "Counselling for Patient & Family",
    description: " Supporting the emotional well being of patients and families throughout the cancer journey",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835767595-awnma-fi_17101398.webp",
    title: "HPV Vaccination",
    description: "Free HPV Vaccination and awareness in schools & community with an aim to reduce cervical and other HPV-related cancers",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835865816-y2bmq-fi_1940611.webp",
    title: "Innovation & technology",
    description: "Investing in research and innovative solutions to improve cancer prevention, detection and care",
  },
];