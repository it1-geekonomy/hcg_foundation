export type Stat = {
  gif: string;
  label: string;
  delay: number;
};

// Order + copy matches the "Our Journey of Impact" reference design.
export const STATS: Stat[] = [
  { gif: "/gifs/6500+.gif", label: "Patients Assisted\nFinancially", delay: 0 },
  { gif: "/gifs/2000.gif", label: "Awareness Program\nConducted", delay: 0.3 },
  { gif: "/gifs/90000.gif", label: "People Benefited\nThrough Awareness Program", delay: 0.6 },
  { gif: "/gifs/4700.gif", label: "Students Benefited\nThrough Healthy Habits", delay: 0.9 },
];