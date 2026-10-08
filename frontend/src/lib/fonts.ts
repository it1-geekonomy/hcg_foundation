import localFont from "next/font/local";
import { Newsreader, Poppins, Roboto } from "next/font/google";

/** Poppins — brand logotype (FOUNDATION). */
export const poppins = Poppins({
	subsets: ["latin"],
	weight: ["600"],
	variable: "--font-poppins",
	display: "swap",
});

/** Roboto — brand tagline (Lasting Inspiration). */
export const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-roboto",
	display: "swap",
});

/** Manrope — regular through bold interface and body text. */
export const manrope = localFont({
	src: [
		{ path: "../app/Fonts/Manrope-ExtraLight.ttf", weight: "200", style: "normal" },
		{ path: "../app/Fonts/Manrope-Light.ttf", weight: "300", style: "normal" },
		{ path: "../app/Fonts/Manrope-Regular.ttf", weight: "400", style: "normal" },
		{ path: "../app/Fonts/Manrope-Medium.ttf", weight: "500", style: "normal" },
		{ path: "../app/Fonts/Manrope-SemiBold.ttf", weight: "600", style: "normal" },
		{ path: "../app/Fonts/Manrope-Bold.ttf", weight: "700", style: "normal" },
	],
	variable: "--font-manrope",
	display: "swap",
});

/*
 * The Tiempos files are Klim trial fonts: letters and digits only, no punctuation or symbols
 * (& ? ! : ; ' " ( ) – — … and more). The `font-tiempos-*` utilities (globals.css) fall back to a
 * matching editorial italic for those glyphs; without it the browser draws them in an upright
 * system serif that looks bold. `adjustFontFallback: false` keeps next/font's metric-matched Times
 * fallback out of the stack so the matching italic is the next font tried.
 */

/** Tiempos Fine — italic editorial text. */
export const tiemposFine = localFont({
	src: [{ path: "../app/Fonts/TestTiemposFine-MediumItalic-BF66457a511be83.otf", weight: "500", style: "italic" }],
	variable: "--font-tiempos-fine",
	display: "swap",
	adjustFontFallback: false,
});

/** Tiempos Headline — light italic display text. */
export const tiemposHeadline = localFont({
	src: [{ path: "../app/Fonts/TestTiemposHeadline-LightItalic-BF66457a5088153.otf", weight: "300", style: "italic" }],
	variable: "--font-tiempos-headline",
	display: "swap",
	adjustFontFallback: false,
});

/** Glyphs missing from Tiempos Fine (medium italic); only downloaded when such a glyph is shown. */
export const tiemposFineGlyphs = Newsreader({
	subsets: ["latin"],
	weight: ["500"],
	style: ["italic"],
	variable: "--font-tiempos-fine-glyphs",
	display: "swap",
	preload: false,
	adjustFontFallback: false,
});

/** Glyphs missing from Tiempos Headline (light italic); only downloaded when such a glyph is shown. */
export const tiemposHeadlineGlyphs = Newsreader({
	subsets: ["latin"],
	weight: ["300"],
	style: ["italic"],
	variable: "--font-tiempos-headline-glyphs",
	display: "swap",
	preload: false,
	adjustFontFallback: false,
});

/** Argesta Display — regular display text. */
export const argestaDisplay = localFont({
	src: [{ path: "../app/Fonts/argestadisplay-regular.otf", weight: "400", style: "normal" }],
	variable: "--font-argestadisplay",
	display: "swap",
});

/** Apply on <html> to register all local font variables. */
export const fontVariableClassNames = [
	manrope.variable,
	poppins.variable,
	roboto.variable,
	tiemposFine.variable,
	tiemposHeadline.variable,
	tiemposFineGlyphs.variable,
	tiemposHeadlineGlyphs.variable,
	argestaDisplay.variable,
].join(" ");

export const FONT_FAMILY_CLASSES = [
	"font-manrope",
	"font-tiempos-fine",
	"font-tiempos-headline",
	"font-argestadisplay",
] as const;
