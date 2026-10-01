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
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835648405-ekopz-fi_9484251.webp",
    title: "Patient support & financial assistance",
    description: "Holistic care and companionship for every patient throughout their journey.",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835680664-wbnx8-fi_6456121.webp",
    title: "Awareness & Education",
    description: "Community education programs that build cancer literacy and reduce stigma.",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835706307-np8n8-fi_10440027.webp",
    title: "Early detection",
    description: "Direct funding to ensure treatment costs never become a barrier to care.",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835737630-bdaco-fi_2163406.webp",
    title: "Counselling for Patient & family",
    description: "Grassroots partnerships that bring services to remote and underserved regions.",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835767595-awnma-fi_17101398.webp",
    title: "HPV Vaccination",
    description: "Free screening camps and diagnostic support for timely intervention.",
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790835865816-y2bmq-fi_1940611.webp",
    title: "Research & innovation",
    description: "Healthy-habits programs for students and training for frontline health workers.",
  },
];