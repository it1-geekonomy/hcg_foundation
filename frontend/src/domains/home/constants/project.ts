export type CardData = {
  number: string;
  title: string;
  date: string;
  description: string;
  image: string;
};

export const CARDS: CardData[] = [
  {
    number: "1",
    title: "Art Therapy & Wellness",
    date: "19 Dec 2025",
    description:
      "Publishing and graphic design. Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.",
    image: "/Projects/p1.png",
  },
  {
    number: "2",
    title: "Cancer Awareness & Screening",
    date: "19 Dec 2025",
    description:
      "Publishing and graphic design. Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.",
    image: "/Projects/p2.png",
  },
  {
    number: "3",
    title: "HPV Vaccination Program",
    date: "19 Dec 2025",
    description:
      "Publishing and graphic design. Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.",
    image: "/Projects/p3.png",
  },
  {
    number: "4",
    title: "Financial Support for Pediatric Patients",
    date: "19 Dec 2025",
    description:
      "Publishing and graphic design. Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.",
    image: "/Projects/p4.png",
  },
];

export const COLLAPSED_WIDTH = 130;