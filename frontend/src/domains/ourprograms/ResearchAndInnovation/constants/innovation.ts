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
    "A joy filled event with the pediatric patients, with some games and cards making activity for they caretakers and doctors with a heart touching message.",
    "At Swasti Gallery, the dual celebrations of Childhood Cancer Day and Valentine's Day brought an abundance of love and resilience as pediatric patients came together for a special event. With hearts full of creativity and hope, the children enthusiastically crafted greeting cards and decorated small wooden boards with a kaleidoscope of colorful tapes, stickers, paint, stamps, and whimsical wooden cutouts of flowers, unicorns, and wings. Their artistic endeavors were not only expressions of joy but also reflections of their indomitable spirit in the face of adversity. Amidst shared laughter and the aroma of snacks, the children reveled in a lively photoshoot, capturing precious moments of camaraderie and strength. The celebration was made even more special with the generous donation of a celebration gifts box by Keto, ensuring that each pediatric patient felt cherished and remembered on this memorable occasion. It was a day filled with love, creativity, and unwavering support, highlighting the beauty and resilience of these young warriors in their journey against cancer.",
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
    "A contactless monitoring platform that tracks breathing, sleep and presence through everyday Wi-Fi-enabled devices, enabling remote monitoring of patients at home during and after treatment. also can you change deep holistics description A preventive health platform that offers an at-home blood test with 100+ advanced diagnostics and one-to-one expert consultations, turning results into personalised guidance for early risk awareness and healthier living.",
  },
  {
    id: "ayurythm",
    name: "AyuRythm",
    logo: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436660818-upmrp-image-91.webp",
    description:
    "A smartphone-based wellness solution built on Ayurvedic principles, using a 30-second pulse test to give personalised lifestyle and diet guidance that supports patients and survivors alongside conventional care.",
  },
];