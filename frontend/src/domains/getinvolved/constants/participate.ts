export interface ParticipateCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
}

export const PARTICIPATE_CARDS: ParticipateCard[] = [
  {
    id: "fundraise",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790848358022-n66ah-vector-13-.webp",
    title: "Fundraise",
    description:
      "Turn your network into meaningful support for cancer patients and families. Every effort helps us reach more lives.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790848289025-ig7i1-rectangle-1660.webp",
  },
  {
    id: "volunteer",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790848585073-tqkmn-la_donate.webp",
    title: "Volunteer",
    description:
      "Share your skills, time and energy to support our programs and communities. Be a part of meaningful change.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436203233-vkh38-rectangle-1660.webp",
  },
  {
    id: "intern",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790848731820-fwtme-vector-14-.webp",
    title: "Intern",
    description:
      "Gain hands-on experience, build your skills, and work on real-world healthcare initiatives.",
    imageUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791449788914-5r68b-rectangle-1660-1-.webp",
  },
];

export interface ParticipateBenefit {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
}

export const PARTICIPATE_BENEFITS: ParticipateBenefit[] = [
  {
    id: "impact",
    title: "Real Impact",
    description: "Contribute to meaningful change.",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849073104-hif9g-hugeicons_heart-handshake.webp",
  },
  {
    id: "community",
    title: "Be Part of a Community",
    description: "Join a network of like-minded changemakers.",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849294533-30kyj-group.webp",
  },
  {
    id: "purpose",
    title: "Grow With Purpose",
    description: "Gain valuable experience and create lasting impact.",
    iconUrl: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790849403490-nnaow-icon-park_oval-love.webp",
  },
];
