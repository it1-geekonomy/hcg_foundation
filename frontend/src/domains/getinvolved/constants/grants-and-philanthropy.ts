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
    iconUrl: "/Get Involved/Granst & Philanthrophy/Support a Patient icon.png",
    title: "Support a Patient",
    description:
      "Help provide financial assistance and essential support to underserved cancer patients during their treatment journey.",
    imageUrl: "/Get Involved/Granst & Philanthrophy/Support a Patient.png",
  },
  {
    id: "support-cancer-awareness",
    iconUrl: "/Get Involved/Granst & Philanthrophy/Support Cancer icon.png",
    title: "Support Cancer Awareness & Early Detection",
    description:
      "Support or partner for awareness programmes, oral cancer camps, early detection, and timely treatment.",
    imageUrl: "/Get Involved/Granst & Philanthrophy/Support Cancer Awareness.png",
  },
  {
    id: "create-philanthropic-partnership",
    iconUrl: "/Get Involved/Granst & Philanthrophy/Create a Philanthropic icon.png",
    title: "Create a Philanthropic Partnership",
    description:
      "Work with HCG Foundation to design a giving initiative aligned with your philanthropic interests, priorities, and desired impact.",
    imageUrl: "/Get Involved/Granst & Philanthrophy/Create a Philanthropic.png",
  },
  {
    id: "support-healthcare-innovation",
    iconUrl: "/Get Involved/Granst & Philanthrophy/Support Healthcar icon.png",
    title: "Support Healthcare Innovation",
    description:
      "Support research, innovation, and technology-led solutions that contribute to better, more accessible, and affordable healthcare.",
    imageUrl: "/Get Involved/Granst & Philanthrophy/Support Healthcare.png",
  },
];
