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
    icon: "/whatwestandfor/heart.png",
    title: "Patient support & financial assistance",
    description: "Holistic care and companionship for every patient throughout their journey.",
  },
  {
    icon: "/whatwestandfor/awareness.png",
    title: "Awareness & Education",
    description: "Community education programs that build cancer literacy and reduce stigma.",
  },
  {
    icon: "/whatwestandfor/finance.png",
    title: "Early detection",
    description: "Direct funding to ensure treatment costs never become a barrier to care.",
  },
  {
    icon: "/whatwestandfor/community1.png",
    title: "Counselling for Patient & family",
    description: "Grassroots partnerships that bring services to remote and underserved regions.",
  },
  {
    icon: "/whatwestandfor/detection.png",
    title: "HPV Vaccination",
    description: "Free screening camps and diagnostic support for timely intervention.",
  },
  {
    icon: "/whatwestandfor/education.png",
    title: "Research & innovation",
    description: "Healthy-habits programs for students and training for frontline health workers.",
  },
];