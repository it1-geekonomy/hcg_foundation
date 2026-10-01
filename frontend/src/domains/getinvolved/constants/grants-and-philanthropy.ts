export interface PhilanthropyCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
}

export const PHILANTHROPY_CARDS: PhilanthropyCard[] = [
  {
    id: "support-a-patient",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790846737220-kr7x9-akar-icons_people-group.webp",
    title: "Support a Patient",
    description:
      "Help provide financial assistance and essential support to underserved cancer patients during their treatment journey.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790845861510-umacw-rectangle-1667.webp",
  },
  {
    id: "support-cancer-awareness",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790847600531-27oon-healthicons_hiv-poss.webp",
    title: "Support Cancer Awareness & Early Detection",
    description:
      "Support or partner for awareness programmes, oral cancer camps, early detection, and timely treatment.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790846127207-0jx6p-rectangle-1667-1-.webp",
  },
  {
    id: "create-philanthropic-partnership",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790847721648-rcnkf-la_hands-helping.webp",
    title: "Create a Philanthropic Partnership",
    description:
      "Work with HCG Foundation to design a giving initiative aligned with your philanthropic interests, priorities, and desired impact.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790846294418-wytjb-rectangle-1668.webp",
  },
  {
    id: "support-healthcare-innovation",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790847797054-jdlwr-vector-12-.webp",
    title: "Support Healthcare Innovation",
    description:
      "Support research, innovation, and technology-led solutions that contribute to better, more accessible, and affordable healthcare.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790846508440-aypa9-rectangle-1667-2-.webp",
  },
];
