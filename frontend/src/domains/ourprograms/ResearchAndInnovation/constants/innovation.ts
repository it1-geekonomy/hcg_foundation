export interface InnovationCompany {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export const INNOVATION_CONTENT = {
  heading: "Innovation and Technology",
  /** Rendered as separate paragraphs */
  paragraphs: [
    "The innovation and technology vertical of HCG Foundation is delivered through Lumos Health, a customised accelerator running since 2018. Lumos Health combines clinical depth with operational scale to support early-stage startups in oncology, diagnostics, women's health, longevity, genetics and genomics, and medtech, bridging the gap between technology and early detection.",
    "We have partnered with Anthill Ventures to help startups scale their technology for global markets, so that it can reach larger populations for early detection and bring innovation into everyday healthcare.",
  ],
  companiesHeading: "Companies we support",
} as const;

/** Card background gradient (top → bottom) and border */
export const INNOVATION_CARD_STYLE = {
  gradientFrom: "#FFFDF8",
  gradientTo: "#FFEEB7",
  border: "#F0E5C1",
} as const;

export const INNOVATION_COMPANIES: InnovationCompany[] = [
  {
    id: "erlysign",
    name: "Erlysign",
    logo: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436555098-5u23p-image-92-1-.webp",
    description:
    "A painless, non-invasive saliva test for oral cancer that gives a clear risk result in 15 minutes, using minimal equipment and few skilled lab staff.",
  },
  {
    id: "deep-holistics",
    name: "Deep Holistics",
    logo: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436611001-zvcwq-group-1000006524.webp",
    description:
    "A personalised preventive health platform that combines blood, gut microbiome, genetic and wearable data to identify risk factors early and guide healthier living for people at risk and for cancer survivors.",
  },
  {
    id: "rayiot",
    name: "RayIoT",
    logo: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436637389-zgg4n-image-89.webp",
    description:
    "A contactless monitoring platform that tracks breathing, sleep and presence through everyday WiFi enabled devices, enabling remote monitoring of patients at home during and after treatment. also can you change deep holistics description A preventive health platform that offers an at-home blood test with 100+ advanced diagnostics and one-to-one expert consultations, turning results into personalised guidance for early risk awareness and healthier living.",
  },
  {
    id: "ayurythm",
    name: "AyuRythm",
    logo: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436660818-upmrp-image-91.webp",
    description:
    "A smartphone based wellness solution built on Ayurvedic principles, using a 30 second pulse test to give personalised lifestyle and diet guidance that supports patients and survivors alongside conventional care.",
  },
];