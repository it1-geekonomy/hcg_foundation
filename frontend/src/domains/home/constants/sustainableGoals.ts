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
    icon: "/SustainableGoals/health.png",
    bg: sustainableGoalsTheme.dark,
  },
  {
    number: "05",
    title: "Gender Equality",
    icon: "/SustainableGoals/gender.png",
    bg: sustainableGoalsTheme.yellow,
  },
  {
    number: "10",
    title: "Reduced Inequalities",
    icon: "/SustainableGoals/inequality.png",
    bg: sustainableGoalsTheme.dark,
  },
  {
    number: "17",
    title: "Partnerships for the Goals",
    icon: "/SustainableGoals/partnerships.png",
    bg: sustainableGoalsTheme.yellow,
  },
];