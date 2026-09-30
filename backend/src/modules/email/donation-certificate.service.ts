import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import {
  PDFDocument,
  PDFFont,
  PDFHexString,
  PDFName,
  PDFOperator,
  PDFOperatorNames,
  PDFPage,
  RGB,
  endMarkedContent,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Donor } from '../donors/entities/donor.entity';

function hex(color: string): RGB {
  const n = parseInt(color.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const TEXT_COLOR = hex('#0D2838');

/**
 * Layout of certificate-base.pdf (exported from 30.docx), in PDF points with
 * the origin at the top-left. The design was drawn on a 5075px-wide frame, so
 * design pixels convert to points with DESIGN_PX.
 */
const DESIGN_PX = 1583.04 / 5075;

// Arial is not redistributable; Liberation Sans has identical metrics.
const FONT_FILES = {
  name: 'Arizonia-Regular.ttf',
  serif: 'CrimsonText-Regular.ttf',
  sans: 'LiberationSans-Regular.ttf',
  sansBold: 'LiberationSans-Bold.ttf',
  // Liberation Sans has no ₹ glyph
  symbol: 'Roboto-Bold.ttf',
} as const;

type FontKey = keyof typeof FONT_FILES;

const NAME = {
  size: 309.92 * DESIGN_PX,
  x: 110.4,
  maxWidth: 1360,
  // Blank band between "THIS IS TO CERTIFY THAT" and the appreciation line
  bandTop: 461.9,
  bandBottom: 636.6,
};

const VALUE = {
  size: 72 * DESIGN_PX,
  letterSpacing: 0.09,
  // Between the column labels and the bottom of the column dividers
  bandTop: 767.8,
  bandBottom: 815.8,
  padding: 12,
};

// Label centres and the space between the dividers on either side
const COLUMNS = [
  { label: 'DONATION AMOUNT', center: 194.7, halfWidth: 130.2 },
  { label: 'DONATION DATE', center: 448.1, halfWidth: 123.0 },
  { label: 'DONATION FOR', center: 703.2, halfWidth: 131.8 },
  { label: 'TRANSACTION REFERENCE NO.', center: 1018.4, halfWidth: 184.4 },
  { label: 'PAN / AADHAAR NO', center: 1353.9, halfWidth: 150.6 },
];

type StaticText = {
  text: string;
  font: FontKey;
  /** Design px */
  size: number;
  /** Fraction of the font size, like CSS letter-spacing in % */
  letterSpacing?: number;
  x: number;
  baseline: number;
  align?: 'left' | 'center';
  color: string;
};

/**
 * The fixed wording of the certificate. 30.docx only has it as pictures and
 * outlines, which strip-certificate-text.py removes from the base PDF, so it
 * is drawn here as selectable text at the size and position of the original.
 */
const STATIC_TEXT: StaticText[] = [
  {
    text: 'DONATION CERTIFICATE',
    font: 'serif',
    size: 166.6,
    letterSpacing: 0.02,
    x: 108.49,
    baseline: 308.78,
    color: '#112653',
  },
  {
    text: 'OF APPRECIATION',
    font: 'sans',
    size: 57.1,
    letterSpacing: 0.25,
    x: 108.74,
    baseline: 357.15,
    color: '#39415C',
  },
  {
    text: 'THIS IS TO CERTIFY THAT',
    font: 'sans',
    size: 57.1,
    letterSpacing: 0.25,
    x: 109.95,
    baseline: 461.73,
    color: '#39415C',
  },
  {
    text: 'In Grateful Appreciation Of Your Generous Contribution Towards Creating A Cancer-Free Tomorrow.',
    font: 'sans',
    size: 65.3,
    letterSpacing: -0.009,
    x: 110.26,
    baseline: 651.38,
    color: '#1F335D',
  },
  ...COLUMNS.map((col): StaticText => ({
    text: col.label,
    font: 'sans',
    size: 52.9,
    letterSpacing: 0.05,
    x: col.center,
    baseline: 767.62,
    align: 'center',
    color: '#585858',
  })),
  // Signatory blocks: dark on the yellow wave (left), white on the pink (right)
  ...[
    { x: 198.0, baseline: 1042.04, color: '#000000' },
    { x: 1363.0, baseline: 1040.3, color: '#FFFFFF' },
  ].flatMap(({ x, baseline, color }): StaticText[] => [
    {
      text: 'Authorized Signatory',
      font: 'sans',
      size: 48.6,
      x,
      baseline,
      align: 'center',
      color,
    },
    {
      text: 'HCG Foundation',
      font: 'sansBold',
      size: 60.8,
      x,
      baseline: baseline + 28.47,
      align: 'center',
      color,
    },
  ]),
  {
    text: 'www.hcgfoundation.org',
    font: 'sans',
    size: 48.5,
    letterSpacing: 0.044,
    x: 706.33,
    baseline: 1093.8,
    color: '#F5F5F1',
  },
];

type Run = { text: string; font: PDFFont };

type FontSet = {
  primary: PDFFont;
  primaryChars: Set<number>;
  fallback: PDFFont;
  capHeight: number;
};

type LineOptions = {
  size: number;
  letterSpacing: number;
  x: number;
  /** Distance of the baseline from the top of the page */
  baseline: number;
  align: 'left' | 'center';
  color: RGB;
};

@Injectable()
export class DonationCertificateService {
  private asset(...parts: string[]) {
    return path.join(__dirname, '..', '..', 'assets', ...parts);
  }

  private readAsset(...parts: string[]) {
    const file = this.asset(...parts);
    if (!existsSync(file)) {
      throw new Error(`Missing certificate asset ${file}`);
    }
    return readFileSync(file);
  }

  async buildCertificate(donor: Donor): Promise<Buffer> {
    return this.buildPdf(donor);
  }

  async buildPdf(donor: Donor): Promise<Buffer> {
    const pdf = await PDFDocument.load(
      this.readAsset('certificates', 'certificate-base.pdf'),
    );
    pdf.registerFontkit(fontkit);
    const page = pdf.getPages()[0];

    const keys = Object.keys(FONT_FILES) as FontKey[];
    const embedded = await Promise.all(
      keys.map((key) =>
        pdf.embedFont(this.readAsset('fonts', FONT_FILES[key]), {
          subset: true,
        }),
      ),
    );
    const fonts = {} as Record<FontKey, PDFFont>;
    const charSets = {} as Record<FontKey, Set<number>>;
    keys.forEach((key, i) => {
      fonts[key] = embedded[i];
      charSets[key] = new Set(embedded[i].getCharacterSet());
    });
    const fontSet = (
      key: FontKey,
      capHeight = 0,
      fallback: FontKey = 'symbol',
    ): FontSet => ({
      primary: fonts[key],
      primaryChars: charSets[key],
      fallback: fonts[fallback],
      capHeight,
    });

    for (const item of STATIC_TEXT) {
      this.drawLine(page, this.splitRuns(item.text, fontSet(item.font)), {
        size: item.size * DESIGN_PX,
        letterSpacing: item.letterSpacing ?? 0,
        x: item.x,
        baseline: item.baseline,
        align: item.align ?? 'left',
        color: hex(item.color),
      });
    }

    const donorName = this.capitalize(donor.fullName?.trim() || 'Donor');
    this.drawFitted(page, donorName, fontSet('name', 0.66, 'sansBold'), {
      size: NAME.size,
      letterSpacing: 0,
      maxWidth: NAME.maxWidth,
      bandTop: NAME.bandTop,
      bandBottom: NAME.bandBottom,
      align: 'left',
      x: NAME.x,
      color: TEXT_COLOR,
    });

    const valueFonts = fontSet('sansBold', 0.688);
    const values = [
      this.formatAmount(donor.amount, donor.currency),
      this.formatDate(donor.createdAt ?? new Date()),
      this.capitalize('General Fund'),
      String(donor.receiptNumber || donor.razorpayPaymentId || '—'),
      donor.pan?.trim().toUpperCase() || '—',
    ];
    const maxWidths = COLUMNS.map((c) => c.halfWidth * 2 - VALUE.padding * 2);
    // One size for the whole row, so a long value shrinks every column equally
    const rowSize = Math.min(
      VALUE.size,
      ...values.map((value, i) => {
        const runs = this.splitRuns(value, valueFonts);
        const natural = this.measure(runs, VALUE.size, VALUE.letterSpacing);
        return (VALUE.size * maxWidths[i]) / natural;
      }),
    );
    values.forEach((value, i) => {
      const col = COLUMNS[i];
      this.drawFitted(page, value, valueFonts, {
        size: rowSize,
        letterSpacing: VALUE.letterSpacing,
        maxWidth: maxWidths[i],
        bandTop: VALUE.bandTop,
        bandBottom: VALUE.bandBottom,
        align: 'center',
        x: col.center,
        color: TEXT_COLOR,
      });
    });

    return Buffer.from(await pdf.save());
  }

  /**
   * Draws text vertically centred (by cap height) in a band, shrinking it
   * until it fits maxWidth so long names or references never overflow.
   */
  private drawFitted(
    page: PDFPage,
    text: string,
    fonts: FontSet,
    opts: Omit<LineOptions, 'baseline'> & {
      maxWidth: number;
      bandTop: number;
      bandBottom: number;
    },
  ) {
    const runs = this.splitRuns(text, fonts);
    const natural = this.measure(runs, opts.size, opts.letterSpacing);
    const size =
      natural > opts.maxWidth
        ? (opts.size * opts.maxWidth) / natural
        : opts.size;
    const bandMiddle = (opts.bandTop + opts.bandBottom) / 2;
    this.drawLine(page, runs, {
      ...opts,
      size,
      baseline: bandMiddle + (fonts.capHeight * size) / 2,
    });
  }

  private drawLine(page: PDFPage, runs: Run[], opts: LineOptions) {
    const { size, color } = opts;
    const spacing = size * opts.letterSpacing;
    const width = this.measure(runs, size, opts.letterSpacing);
    const y = page.getHeight() - opts.baseline;
    let x = opts.align === 'center' ? opts.x - width / 2 : opts.x;

    // Wide letter spacing makes viewers copy "O F  A P P R E C I A T I O N";
    // ActualText tells them the real string.
    const text = PDFHexString.fromText(runs.map((r) => r.text).join(''));
    const actualText = `<< /ActualText ${text.toString()} >>`;
    page.pushOperators(
      PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence, [
        PDFName.of('Span'),
        actualText,
      ]),
      pushGraphicsState(),
      setCharacterSpacing(spacing),
    );
    for (const run of runs) {
      page.drawText(run.text, { x, y, size, font: run.font, color });
      x +=
        run.font.widthOfTextAtSize(run.text, size) +
        spacing * [...run.text].length;
    }
    page.pushOperators(popGraphicsState(), endMarkedContent());
  }

  private splitRuns(text: string, fonts: FontSet): Run[] {
    const runs: Run[] = [];
    for (const char of text) {
      const font = fonts.primaryChars.has(char.codePointAt(0)!)
        ? fonts.primary
        : fonts.fallback;
      const last = runs[runs.length - 1];
      if (last && last.font === font) last.text += char;
      else runs.push({ text: char, font });
    }
    return runs;
  }

  /** Visible width: letter spacing sits between characters, not after the last one. */
  private measure(runs: Run[], size: number, letterSpacing: number) {
    const chars = runs.reduce((n, r) => n + [...r.text].length, 0);
    const glyphs = runs.reduce(
      (w, r) => w + r.font.widthOfTextAtSize(r.text, size),
      0,
    );
    return glyphs + size * letterSpacing * Math.max(0, chars - 1);
  }

  private capitalize(text: string) {
    return text.replace(
      /(^|\s)(\S)/g,
      (_, space: string, first: string) => space + first.toUpperCase(),
    );
  }

  private formatAmount(amount: string | number, currency: string) {
    const n = Number(amount);
    const formatted = Number.isFinite(n)
      ? n.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
          maximumFractionDigits: 2,
        })
      : String(amount);
    const symbols: Record<string, string> = {
      INR: '₹ ',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
      SGD: 'S$',
      AUD: 'A$',
      CAD: 'C$',
    };
    return `${symbols[currency] ?? `${currency} `}${formatted}`;
  }

  /** "30 Sep 2026" in IST; built from parts because ICU versions disagree on "Sep"/"Sept". */
  private formatDate(date: Date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).formatToParts(date);
    const part = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '';
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${part('day')} ${months[Number(part('month')) - 1]} ${part('year')}`;
  }
}
