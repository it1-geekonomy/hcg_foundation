import localFont from "next/font/local";

/**
 * Manrope — interface and body text. Variable WOFF2 (latin + latin-ext) sourced from
 * @fontsource-variable/manrope (Google Fonts / OFL license). Replaces the old static
 * TTF files: one file covers the full weight axis (200–700).
 */
export const manrope = localFont({
	src: [
		{ path: "../app/Fonts/Manrope-variable.woff2",     weight: "200 700", style: "normal" },
		{ path: "../app/Fonts/Manrope-variable-ext.woff2", weight: "200 700", style: "normal" },
	],
	variable: "--font-manrope",
	display: "swap",
	preload: true,
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
	src: [{ path: "../app/Fonts/TestTiemposFine-MediumItalic-BF66457a511be83.woff2", weight: "500", style: "italic" }],
	variable: "--font-tiempos-fine",
	display: "swap",
	adjustFontFallback: false,
});

/** Tiempos Headline — light italic display text. */
export const tiemposHeadline = localFont({
	src: [{ path: "../app/Fonts/TestTiemposHeadline-LightItalic-BF66457a5088153.woff2", weight: "300", style: "italic" }],
	variable: "--font-tiempos-headline",
	display: "swap",
	adjustFontFallback: false,
});

/** Argesta Display — regular display text. */
export const argestaDisplay = localFont({
	src: [{ path: "../app/Fonts/argestadisplay-regular.woff2", weight: "400", style: "normal" }],
	variable: "--font-argestadisplay",
	display: "swap",
});

/** Apply on <html> to register all local font variables. */
export const fontVariableClassNames = [
	manrope.variable,
	tiemposFine.variable,
	tiemposHeadline.variable,
	argestaDisplay.variable,
].join(" ");

export const FONT_FAMILY_CLASSES = [
	"font-manrope",
	"font-tiempos-fine",
	"font-tiempos-headline",
	"font-argestadisplay",
] as const;
