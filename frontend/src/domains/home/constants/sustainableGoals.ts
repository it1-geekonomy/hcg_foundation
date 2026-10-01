export interface SustainableGoal {
  number: string;
  title: string;
  icon: string;
  bg?: string;
}

export const sustainableGoalsTheme = {
  panelBg: "#949494",
  dark: "#565656",
  yellow: "#FCCC2D",
};

export const sustainableGoals: SustainableGoal[] = [
  {
    number: "03",
    title: "Good Health and Well-Being",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790769710746-lh4bp-noun-good-heart-health-4246557-1.webp",
    bg: "#369B40",
  },
  {
    number: "05",
    title: "Gender Equality",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790769764437-u9273-noun-gender-equality-4311106-1.webp",
    bg: "#F23727",
  },
  {
    number: "10",
    title: "Reduced Inequalities",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790770017108-pj3ay-noun-decrease-inequality-6197827-1-2-.webp",
    bg: "#D9176C",
  },
  {
    number: "17",
    title: "Partnerships for the Goals",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790770076741-64hi5-noun-partnerships-for-good-7602133-1-1-.webp",
    bg: "#023A6D",
  },
];