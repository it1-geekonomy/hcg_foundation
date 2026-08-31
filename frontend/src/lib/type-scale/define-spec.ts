import type { TypographySpecDefinition } from "./types";

/** Identity helper — keeps spec objects typed and grep-friendly in specs.ts */
export function defineTypographySpec(definition: TypographySpecDefinition): TypographySpecDefinition {
  return definition;
}
