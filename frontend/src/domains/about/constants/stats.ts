import { createElement, type ReactNode } from "react";

export interface Stat {
  /** The big number/stat, e.g. "4,192+" */
  value: string;
  /** Label under the value, e.g. "Patients Assisted Financially" */
  label: ReactNode;
}

const withBreak = (before: string, after: string): ReactNode =>
  createElement(
    "span",
    null,
    before,
    " ",
    createElement("br", { className: "" }),
    " ",
    after
  );

export const stats: Stat[] = [
  { value: "4,192+", label: withBreak("Patients Assisted", "Financially") },
  { value: "482+", label: withBreak("Awareness &", "Detection Camps") },
  { value: "700+", label: withBreak("Students Benefited", "Through Healthy Habits") },
  { value: "52,000+", label: withBreak("Awareness Program", "Participants") },
];