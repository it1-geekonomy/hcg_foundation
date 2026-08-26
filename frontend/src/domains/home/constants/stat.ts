export type Stat = {
  value: number;
  suffix: string;
  label: string;
  delay: number;
};

// Order + copy matches the "Our Journey of Impact" reference design.
export const STATS: Stat[] = [
  { value: 4, suffix: "k+", label: "Awareness &\nDetection Camps", delay: 0 },
  { value: 482, suffix: "+", label: "Awareness Program\nParticipants", delay: 0.3 },
  { value: 700, suffix: "+", label: "Patients Assisted\nFinancially", delay: 0.6 },
  { value: 52, suffix: "k+", label: "Students Benefited\nThrough Healthy Habits", delay: 0.9 },
];