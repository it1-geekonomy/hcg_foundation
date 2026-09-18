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
    title: "Patient Support",
    description: "Holistic care and companionship for every patient throughout their journey.",
  },
  {
    icon: "/whatwestandfor/awareness.png",
    title: "Awareness",
    description: "Community education programs that build cancer literacy and reduce stigma.",
  },
  {
    icon: "/whatwestandfor/finance.png",
    title: "Financial Assistance",
    description: "Direct funding to ensure treatment costs never become a barrier to care.",
  },
  {
    icon: "/whatwestandfor/community1.png",
    title: "Community Outreach",
    description: "Grassroots partnerships that bring services to remote and underserved regions.",
  },
  {
    icon: "/whatwestandfor/detection.png",
    title: "Early Detection",
    description: "Free screening camps and diagnostic support for timely intervention.",
  },
  {
    icon: "/whatwestandfor/education.png",
    title: "Education",
    description: "Healthy-habits programs for students and training for frontline health workers.",
  },
];