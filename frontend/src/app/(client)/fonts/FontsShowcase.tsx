"use client";

import { useEffect, useRef, useState } from "react";

import Typography from "@/lib/Typography";
import {
  FIGMA_SECTIONS,
  figmaClamp,
  figmaTypographySpecs,
  fluidTypoVars,
  getBreakpointFontSizes,
  TYPO_FLUID_ATTR,
  type FigmaTextSpec,
} from "@/lib/figma-typography-specs";
import {
  fontFamilies,
  typography,
  getVariantFontSizes,
  type FontFamilyToken,
  type TypographyVariant,
} from "@/lib/typography-tokens";
import { FONT_FAMILY_CLASSES } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SAMPLE =
  "The quick brown fox jumps over the lazy dog. HCG Foundation — Lasting Inspirations.";

const MANROPE_WEIGHTS = [
  { label: "ExtraLight 200", className: "font-manrope font-extralight" },
  { label: "Light 300", className: "font-manrope font-light" },
  { label: "Regular 400", className: "font-manrope font-normal" },
  { label: "Medium 500", className: "font-manrope font-medium" },
  { label: "SemiBold 600", className: "font-manrope font-semibold" },
  { label: "Bold 700", className: "font-manrope font-bold" },
] as const;

const LOADED_FONTS: {
  token: FontFamilyToken | "tiempos-headline";
  utility: string;
  figmaName: string;
  note?: string;
}[] = [
  { token: "manrope", utility: "font-manrope", figmaName: "Manrope" },
  {
    token: "tiempos-headline",
    utility: "font-tiempos-headline",
    figmaName: "Test Tiempos Headline",
    note: "Light Italic · 300 — hero 64px",
  },
  {
    token: "tiempos-fine",
    utility: "font-tiempos-fine",
    figmaName: "Test Tiempos Fine",
    note: "Medium Italic · 500 — Donate Now 32px",
  },
  {
    token: "argesta-display",
    utility: "font-argestadisplay",
    figmaName: "Argesta Display",
    note: "Regular · 400 — body copy",
  },
  {
    token: "tiempos-text",
    utility: "",
    figmaName: "Test Tiempos Text",
    note: "Not loaded — used for 46px section headings (falls back to Georgia)",
  },
  { token: "poppins", utility: "", figmaName: "Poppins", note: "Not loaded — logo FOUNDATION" },
  { token: "poppins", utility: "", figmaName: "Roboto", note: "Not loaded — logo tagline" },
];

function useViewportWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

function responsiveZone(width: number) {
  if (width < 640) return { label: "Base · fixed (< sm)", tone: "bg-amber-100 text-amber-900" };
  if (width < 768) return { label: "SM · fixed", tone: "bg-orange-100 text-orange-900" };
  if (width < 1024) return { label: "MD · fixed", tone: "bg-sky-100 text-sky-900" };
  if (width >= 1440) return { label: "LG+ · clamp (max)", tone: "bg-emerald-100 text-emerald-900" };
  return { label: "LG+ · clamp (fluid)", tone: "bg-emerald-100 text-emerald-900" };
}

function LiveMeasure({ children, onMeasure }: { children: React.ReactNode; onMeasure: (px: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => onMeasure(parseFloat(window.getComputedStyle(el).fontSize));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [onMeasure]);

  return <div ref={ref}>{children}</div>;
}

function FigmaSpecRow({ spec }: { spec: FigmaTextSpec }) {
  const [computedPx, setComputedPx] = useState<number | null>(null);
  const clamp = figmaClamp(spec.mobilePx, spec.desktopPx);
  const sizes = getBreakpointFontSizes(spec.mobilePx, spec.desktopPx, clamp);
  const pct =
    computedPx !== null
      ? Math.round(((computedPx - spec.mobilePx) / (spec.desktopPx - spec.mobilePx)) * 100)
      : null;

  const isDark = spec.color.toLowerCase().includes("#fff") || spec.color.startsWith("rgba(255");
  const previewBg = isDark ? "bg-[#373737]" : "bg-[#FFF6D8]";

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">{spec.section}</p>
          <h3 className="font-manrope text-base font-semibold text-neutral-900">{spec.label}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {spec.loaded ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-xs text-emerald-800">
              loaded
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-xs text-amber-800">
              fallback
            </span>
          )}
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-mono text-xs text-neutral-700">
            {spec.id}
          </span>
        </div>
      </div>

      <div className={cn("mb-4 rounded-lg px-4 py-5", previewBg)}>
        <LiveMeasure onMeasure={setComputedPx}>
          <p
            {...{ [TYPO_FLUID_ATTR]: "" }}
            className={spec.fontClass}
            style={{
              ...fluidTypoVars(spec.mobilePx, spec.desktopPx, clamp),
              fontFamily: spec.fontFamily,
              fontWeight: spec.weight,
              fontStyle: spec.fontStyle,
              lineHeight: spec.lineHeight,
              letterSpacing: spec.letterSpacing,
              color: spec.color,
              textAlign: spec.textAlign,
              textTransform: spec.textTransform,
            }}
          >
            {spec.sample}
          </p>
        </LiveMeasure>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Fixed (base/sm/md)</dt>
          <dd className="mt-1 font-mono text-xs text-neutral-700">
            {sizes.px.base}px · {sizes.px.sm}px · {sizes.px.md}px
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">LG+ clamp max</dt>
          <dd className="mt-1 font-mono text-xs text-neutral-700">{spec.desktopPx}px</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Live size</dt>
          <dd className="mt-1 font-mono text-xs text-neutral-900">
            {computedPx !== null ? `${computedPx.toFixed(2)}px` : "…"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Scale (lg+ only)</dt>
          <dd className="mt-1">
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#FDB723] transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-600">
              {pct !== null ? `${pct}% of Figma range` : "…"}
            </p>
          </dd>
        </div>
      </dl>
    </article>
  );
}

function VariantRow({ variant }: { variant: TypographyVariant }) {
  const [computedPx, setComputedPx] = useState<number | null>(null);
  const scale = typography[variant];
  const sizes = getVariantFontSizes(variant);

  useEffect(() => {
    const el = document.getElementById(`variant-${variant}`);
    if (!el) return;
    const measure = () => setComputedPx(parseFloat(window.getComputedStyle(el).fontSize));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [variant]);

  const pct =
    computedPx !== null
      ? Math.round(
          ((computedPx - scale.sizeRange.minPx) / (scale.sizeRange.maxPx - scale.sizeRange.minPx)) * 100,
        )
      : null;

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">Token</p>
          <h3 className="font-manrope text-lg font-semibold text-neutral-900">{variant}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs text-neutral-700">
            {scale.weight} · {scale.fontStyle}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs text-neutral-700">
            LH {scale.lineHeight}
          </span>
        </div>
      </div>

      <div className="mb-4 border-y border-dashed border-neutral-200 py-4" id={`variant-${variant}`}>
        <Typography variant={variant} className="text-neutral-900">
          {scale.sample}
        </Typography>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Fixed (base/sm/md)</dt>
          <dd className="mt-1 font-mono text-xs text-neutral-700">
            {sizes.px.base}px · {sizes.px.sm}px · {sizes.px.md}px
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">LG+ clamp</dt>
          <dd className="mt-1 break-all font-mono text-xs text-neutral-700">{scale.size}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Live</dt>
          <dd className="mt-1 font-mono text-xs text-neutral-900">
            {computedPx !== null ? `${computedPx.toFixed(2)}px` : "…"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-400">Progress (lg+)</dt>
          <dd className="mt-1">
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }}
              />
            </div>
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function FontsShowcase() {
  const width = useViewportWidth();
  const zone = responsiveZone(width);
  const variants = Object.keys(typography) as TypographyVariant[];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-manrope text-xs uppercase tracking-[0.2em] text-neutral-400">
              HCG Foundation · 1920px Figma
            </p>
            <h1 className="font-manrope text-2xl font-bold text-neutral-900">Fonts & Typography</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-3 py-1 text-xs font-medium", zone.tone)}>
              {zone.label}
            </span>
            <span className="rounded-full bg-neutral-900 px-3 py-1 font-mono text-xs text-white">
              {width > 0 ? `${width}px viewport` : "…"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-10">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-manrope text-sm font-semibold text-neutral-900">How sizing works</h2>
          <ul className="mt-3 space-y-2 font-manrope text-sm text-neutral-600">
            <li>
              <strong className="font-medium text-neutral-800">Base (&lt; 640px)</strong> — fixed at
              mobile floor (min px)
            </li>
            <li>
              <strong className="font-medium text-neutral-800">SM (640–767px)</strong> — fixed step
              (+20% toward desktop)
            </li>
            <li>
              <strong className="font-medium text-neutral-800">MD (768–1023px)</strong> — fixed step
              (+45% toward desktop)
            </li>
            <li>
              <strong className="font-medium text-neutral-800">LG+ (≥ 1024px)</strong> —{" "}
              <code className="font-mono text-xs">clamp()</code> fluidly scales to Figma desktop max
            </li>
          </ul>
        </section>

        {/* ── Figma hero preview ── */}
        <section className="overflow-hidden rounded-2xl bg-[#0B0F17] text-white">
          <div className="border-b border-white/10 px-6 py-3">
            <p className="font-manrope text-xs uppercase tracking-widest text-white/50">
              Live preview · Hero section
            </p>
          </div>
          <div className="space-y-6 px-6 py-10 md:px-10">
            <span
              {...{ [TYPO_FLUID_ATTR]: "" }}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/12 px-4 py-2 font-manrope backdrop-blur-sm"
              style={{
                ...fluidTypoVars(13, 14.88, figmaClamp(13, 14.88)),
                letterSpacing: "0.01em",
              }}
            >
              Together We Care
            </span>
            <p
              {...{ [TYPO_FLUID_ATTR]: "" }}
              className="max-w-3xl font-tiempos-headline italic"
              style={{
                ...fluidTypoVars(34, 64, figmaClamp(34, 64)),
                lineHeight: 1.22,
                fontWeight: 400,
              }}
            >
              Together, We Bring Hope Beyond Cancer
            </p>
            <p
              {...{ [TYPO_FLUID_ATTR]: "" }}
              className="max-w-xl font-argestadisplay"
              style={{
                ...fluidTypoVars(16, 20, figmaClamp(16, 20)),
                lineHeight: 1.5,
                letterSpacing: "0.01em",
                color: "rgba(255,255,255,0.61)",
              }}
            >
              Every contribution helps provide care, hope, and essential support to individuals and
              families, creating brighter tomorrows together.
            </p>
            <button
              type="button"
              {...{ [TYPO_FLUID_ATTR]: "" }}
              className="rounded-sm bg-[#FFD43B] px-5 py-3 font-manrope font-semibold text-[#262626]"
              style={fluidTypoVars(16, 18, figmaClamp(16, 18))}
            >
              Know More
            </button>
          </div>
        </section>

        {/* ── Font families ── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-manrope text-xl font-semibold text-neutral-900">Font families</h2>
            <p className="mt-1 font-manrope text-sm text-neutral-600">
              Faces from the Figma export mapped to{" "}
              <code className="font-mono text-xs">fonts.ts</code> loaders.
            </p>
          </div>
          <div className="grid gap-4">
            {LOADED_FONTS.map(({ token, utility, figmaName, note }) => (
              <div key={figmaName} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="font-manrope text-base font-semibold text-neutral-900">{figmaName}</h3>
                  {utility ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs text-emerald-800">
                      {utility}
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-800">
                      not loaded
                    </span>
                  )}
                  {note && <span className="font-manrope text-xs text-neutral-500">{note}</span>}
                </div>
                <p
                  className={cn("text-2xl text-neutral-900", utility)}
                  style={{ fontFamily: fontFamilies[token as FontFamilyToken] ?? specFont(figmaName) }}
                >
                  {SAMPLE}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Figma specs by section ── */}
        <section className="space-y-8">
          <div>
            <h2 className="font-manrope text-xl font-semibold text-neutral-900">
              Figma typography specs
            </h2>
            <p className="mt-1 max-w-3xl font-manrope text-sm text-neutral-600">
              Every text style from your 1920px design export. Below{" "}
              <code className="font-mono text-xs">lg (1024px)</code> sizes are fixed per breakpoint
              (base / sm / md). From <code className="font-mono text-xs">lg</code> upward,{" "}
              <code className="font-mono text-xs">clamp()</code> scales fluidly to the Figma desktop
              max. Resize the browser — the live size and progress bar update in real time.
            </p>
          </div>

          {FIGMA_SECTIONS.map((section) => {
            const specs = figmaTypographySpecs.filter((s) => s.section === section);
            if (specs.length === 0) return null;
            return (
              <div key={section} className="space-y-4">
                <h3 className="font-manrope text-lg font-semibold text-neutral-800">{section}</h3>
                <div className="space-y-4">
                  {specs.map((spec) => (
                    <FigmaSpecRow key={spec.id} spec={spec} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Manrope weights ── */}
        <section className="space-y-6">
          <h2 className="font-manrope text-xl font-semibold text-neutral-900">Manrope weights</h2>
          <div className="grid gap-3">
            {MANROPE_WEIGHTS.map(({ label, className }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono text-xs text-neutral-500">{label}</span>
                <p className={cn("text-lg text-neutral-900", className)}>{SAMPLE}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography tokens ── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-manrope text-xl font-semibold text-neutral-900">Typography tokens</h2>
            <p className="mt-1 font-manrope text-sm text-neutral-600">
              All variants from <code className="font-mono text-xs">typography-tokens.ts</code> via{" "}
              <code className="font-mono text-xs">&lt;Typography variant=&quot;…&quot; /&gt;</code>.
              Fixed sizes at base, sm, and md; fluid clamp from lg (1024px) to desktop max.
            </p>
          </div>
          <div className="space-y-4">
            {variants.map((variant) => (
              <VariantRow key={variant} variant={variant} />
            ))}
          </div>
        </section>

        {/* ── Pairings ── */}
        <section className="space-y-6">
          <h2 className="font-manrope text-xl font-semibold text-neutral-900">Font pairings</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {FONT_FAMILY_CLASSES.map((familyClass) => (
              <div key={familyClass} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="mb-4 font-mono text-xs text-neutral-500">{familyClass}</p>
                <Typography variant="display-1" className={cn("text-neutral-900", familyClass)}>
                  Hope Begins With Care
                </Typography>
                <Typography variant="body-2" className={cn("mt-3 text-neutral-700", familyClass)}>
                  Supporting patients across India
                </Typography>
                <Typography variant="body-8" className={cn("mt-3 text-neutral-600", familyClass)}>
                  Pair any token with any loaded font utility.
                </Typography>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function specFont(figmaName: string): string {
  if (figmaName === "Roboto") return "'Roboto', sans-serif";
  if (figmaName === "Test Tiempos Text") return "'Tiempos Text', Georgia, serif";
  return "'Poppins', sans-serif";
}
