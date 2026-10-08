import { createElement, type ReactNode } from "react";

export interface Stat {
  /** The big number/stat, e.g. "4,192+" */
  value: string;
  /** Label under the value, e.g. "Patients Assisted Financially" */
  label: ReactNode;
}

/** Every label is exactly two lines, so all four columns align. */
const withBreak = (before: string, after: string): ReactNode =>
  createElement("span", null, before, createElement("br"), after);

export const stats: Stat[] = [
  { value: "6,500+", label: withBreak("Patients Assisted", "Financially") },
  { value: "2,000+", label: withBreak("Awareness Program", "Conducted") },
  { value: "90,000+", label: withBreak("People Benefited Through", "Awareness Program") },
  { value: "4,700+", label: withBreak("Students Benefited Through", "Healthy Habits") },
];