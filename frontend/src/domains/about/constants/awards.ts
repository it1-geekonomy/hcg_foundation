import type { ReactNode } from "react";

export interface Award {
  /** Framed award image path (from /public), e.g. "/awardssection/award1.png" */
  image: string;
  /** Award title, e.g. "Bengaluru NGO's Leadership Award 2017" */
  title: ReactNode;
  /** Supporting description text */
  description: ReactNode;
}

export const awards: Award[] = [
  {
    image: "/awardssection/award1.png",
    title: "Bengaluru NGO's Leadership Award 2017",
    description:
      "HCG Foundation was conferred with the Bengaluru NGO's Leadership Award 2017 in recognition of its impactful contribution towards social development and cancer care.",
  },
  {
    image: "/awardssection/award2.png",
    title: "National CSR Leadership – Certificate of Merit 2016",
    description:
      "HCG Foundation received the National CSR Leadership – Certificate of Merit 2016 for its dedicated efforts in advancing healthcare and creating lasting community impact.",
  },
  
];