export type Stat = {
  value: number;
  suffix: string;
  label: string;
  delay: number;
};
 
// Order + copy matches the "Our Journey of Impact" reference design.
export const STATS: Stat[] = [
  { value: 6500, suffix: "+", label: "Patients Assisted\nFinancially", delay: 0 },
  { value: 1578, suffix: "", label: "Awareness Program\nParticipants", delay: 0.3 },
  { value: 85000, suffix: "+", label: "Participants", delay: 0.6 },
  { value: 4620, suffix: "", label: "Students Benefited\nThrough Healthy Habits", delay: 0.9 },
];