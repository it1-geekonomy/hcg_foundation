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

/** Tailwind utilities from fonts.ts / globals.css */
export const fontClassByToken: Record<FontFamilyToken, string> = {
  manrope: "font-manrope",
  poppins: "font-poppins",
  roboto: "font-roboto",
  "tiempos-text": "font-tiempos-text",
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

export function getWeightClass(weight?: number): string {
  switch (weight) {
    case 100:
      return "font-thin";
    case 200:
      return "font-extralight";
    case 300:
      return "font-light";
    case 400:
      return "font-normal";
    case 500:
      return "font-medium";
    case 600:
      return "font-semibold";
    case 700:
      return "font-bold";
    case 800:
      return "font-extrabold";
    case 900:
      return "font-black";
    default:
      return "font-normal";
  }
}

export function getFontStyleClass(fontStyle?: string): string {
  return fontStyle === "italic" ? "italic" : "not-italic";
}

