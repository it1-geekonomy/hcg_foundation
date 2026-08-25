import localFont from "next/font/local";

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

/** Tiempos Fine — italic editorial text. */
export const tiemposFine = localFont({
	src: [{ path: "../app/Fonts/TestTiemposFine-MediumItalic-BF66457a511be83.otf", weight: "500", style: "italic" }],
	variable: "--font-tiempos-fine",
	display: "swap",
});

/** Tiempos Headline — light italic display text. */
export const tiemposHeadline = localFont({
	src: [{ path: "../app/Fonts/TestTiemposHeadline-LightItalic-BF66457a5088153.otf", weight: "300", style: "italic" }],
	variable: "--font-tiempos-headline",
	display: "swap",
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
