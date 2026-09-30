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
    iconUrl: "/Get Involved/Participate/Fundraise icon.png",
    title: "Fundraise",
    description:
      "Turn your network into meaningful support for cancer patients and families. Every effort helps us reach more lives.",
    imageUrl: "/Get Involved/Participate/Fundraise.png",
  },
  {
    id: "volunteer",
    iconUrl: "/Get Involved/Participate/Volunteer icon.png",
    title: "Volunteer",
    description:
      "Share your skills, time and energy to support our programs and communities. Be a part of meaningful change.",
    imageUrl: "/Get Involved/Participate/Volunteer.png",
  },
  {
    id: "intern",
    iconUrl: "/Get Involved/Participate/Intern icon.png",
    title: "Intern",
    description:
      "Gain hands-on experience, build your skills, and work on real-world healthcare initiatives.",
    imageUrl: "/Get Involved/Participate/Intern.png",
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
    iconUrl: "/Get Involved/Participate/Real Impact icon.png",
  },
  {
    id: "community",
    title: "Be Part of a Community",
    description: "Join a network of like-minded changemakers.",
    iconUrl: "/Get Involved/Participate/Be Part of a Community icon.png",
  },
  {
    id: "purpose",
    title: "Grow With Purpose",
    description: "Gain valuable experience and create lasting impact.",
    iconUrl: "/Get Involved/Participate/Grow With Purpose icon.png",
  },
];
