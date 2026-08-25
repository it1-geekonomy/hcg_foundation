export const STATS = [
  {
    value: "50K+",
    label: "Patients Supported",
    story: "It began with one person who needed care.",
  },
  {
    value: "1,200+",
    label: "Screening Camps",
    story: "One village at a time, the circle widened.",
  },
  {
    value: "15+",
    label: "Years of Service",
    story: "Fifteen years later, we are still growing.",
  },
];

export const T_SEED = 320;
export const T_GROW = 680;
export const T_SOLID = 480;
export const T_HOLD = 100;
export const T_EXIT = 200;
export const STAT_MS = T_SEED + T_GROW + T_SOLID + T_HOLD + T_EXIT;

export type Stage = "seed" | "grow" | "solid" | "hold" | "exit";
export type Phase = number | "brand" | "lift";

export type Particle = {
  sx: number;
  sy: number;
  mx: number;
  my: number;
  hx: number;
  hy: number;
  r: number;
  hue: number;
  d: number;
  fade: number;
};
