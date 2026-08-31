export type FontFamilyToken =
  | "manrope"
  | "poppins"
  | "roboto"
  | "tiempos-text"
  | "tiempos-fine"
  | "tiempos-headline"
  | "argesta-display";

/** CSS font stacks — single place for face names */
export const fontFamilies: Record<FontFamilyToken, string> = {
  manrope: "'Manrope', sans-serif",
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
  "tiempos-text": "'Tiempos Text', Georgia, serif",
  "tiempos-fine": "'Tiempos Fine', Georgia, serif",
  "tiempos-headline": "'Tiempos Headline', Georgia, serif",
  "argesta-display": "'Argesta Display', serif",
};

/** Tailwind utilities from fonts.ts / globals.css — only for locally loaded faces */
export const fontClassByToken: Partial<Record<FontFamilyToken, string>> = {
  manrope: "font-manrope",
  "tiempos-fine": "font-tiempos-fine",
  "tiempos-headline": "font-tiempos-headline",
  "argesta-display": "font-argestadisplay",
};

/** Mirrors @font-face loaders in src/lib/fonts.ts */
export const loadedFontTokens = new Set<FontFamilyToken>([
  "manrope",
  "tiempos-fine",
  "tiempos-headline",
  "argesta-display",
]);

export function resolveFontFamily(token: FontFamilyToken) {
  return {
    fontFamily: fontFamilies[token],
    fontClass: fontClassByToken[token],
    loaded: loadedFontTokens.has(token),
  };
}
