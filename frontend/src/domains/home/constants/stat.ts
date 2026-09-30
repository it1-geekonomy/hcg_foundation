export type Stat = {
  gif: string;
  label: string;
  delay: number;
};

// Order + copy matches the "Our Journey of Impact" reference design.
export const STATS: Stat[] = [
  { gif: "/statsgif/6500.gif", label: "Patients Assisted\nFinancially", delay: 0 },
  { gif: "/statsgif/1578.gif", label: "Awareness Program\nParticipants", delay: 0.3 },
  { gif: "/statsgif/85k.gif", label: "Participants", delay: 0.6 },
  { gif: "/statsgif/4620.gif", label: "Students Benefited\nThrough Healthy Habits", delay: 0.9 },
];