import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  RGB,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Donor } from '../donors/entities/donor.entity';

const TEXT_COLOR = rgb(0x0d / 255, 0x28 / 255, 0x38 / 255);

/**
 * Layout of certificate-base.pdf (exported from 30.docx), in PDF points with
 * the origin at the top-left. The design was drawn on a 5075px-wide frame, so
 * design pixels convert to points with DESIGN_PX.
 */
const DESIGN_PX = 1583.04 / 5075;

const NAME = {
  font: 'Arizonia-Regular.ttf',
  size: 309.92 * DESIGN_PX,
  x: 110.4,
  maxWidth: 1360,
  // Blank band between "THIS IS TO CERTIFY THAT" and the appreciation line
  bandTop: 461.9,
  bandBottom: 636.6,
};

// Arial Bold is not redistributable; Liberation Sans Bold has identical metrics.
const VALUE = {
  font: 'LiberationSans-Bold.ttf',
  size: 72 * DESIGN_PX,
  letterSpacing: 0.09,
  // Between the column labels and the bottom of the column dividers
  bandTop: 767.8,
  bandBottom: 815.8,
  padding: 12,
};

// Label centres and the space between the dividers on either side
const COLUMNS = [
  { center: 194.7, halfWidth: 130.2 }, // Donation amount
  { center: 448.1, halfWidth: 123.0 }, // Donation date
  { center: 703.2, halfWidth: 131.8 }, // Donation for
  { center: 1018.4, halfWidth: 184.4 }, // Transaction reference no.
  { center: 1353.9, halfWidth: 150.6 }, // PAN / Aadhaar no.
];

type Run = { text: string; font: PDFFont };

type FontSet = {
  primary: PDFFont;
  primaryChars: Set<number>;
  fallback: PDFFont;
  capHeight: number;
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

    const embed = (file: string) =>
      pdf.embedFont(this.readAsset('fonts', file), { subset: true });
    const [nameFont, valueFont, symbolFont] = await Promise.all([
      embed(NAME.font),
      embed(VALUE.font),
      // Liberation Sans has no ₹ glyph
      embed('Roboto-Bold.ttf'),
    ]);

    const nameFonts: FontSet = {
      primary: nameFont,
      primaryChars: new Set(nameFont.getCharacterSet()),
      fallback: valueFont,
      capHeight: 0.66,
    };
    const valueFonts: FontSet = {
      primary: valueFont,
      primaryChars: new Set(valueFont.getCharacterSet()),
      fallback: symbolFont,
      capHeight: 0.688,
    };

    const donorName = this.capitalize(donor.fullName?.trim() || 'Donor');
    this.drawFitted(page, donorName, nameFonts, {
      size: NAME.size,
      letterSpacing: 0,
      maxWidth: NAME.maxWidth,
      bandTop: NAME.bandTop,
      bandBottom: NAME.bandBottom,
      align: 'left',
      x: NAME.x,
      color: TEXT_COLOR,
    });

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
    opts: {
      size: number;
      letterSpacing: number;
      maxWidth: number;
      bandTop: number;
      bandBottom: number;
      align: 'left' | 'center';
      x: number;
      color: RGB;
    },
  ) {
    const runs = this.splitRuns(text, fonts);
    const natural = this.measure(runs, opts.size, opts.letterSpacing);
    const size =
      natural > opts.maxWidth
        ? (opts.size * opts.maxWidth) / natural
        : opts.size;
    const spacing = size * opts.letterSpacing;
    const width = this.measure(runs, size, opts.letterSpacing);

    const bandMiddle = (opts.bandTop + opts.bandBottom) / 2;
    const baselineFromTop = bandMiddle + (fonts.capHeight * size) / 2;
    const y = page.getHeight() - baselineFromTop;
    let x = opts.align === 'center' ? opts.x - width / 2 : opts.x;

    page.pushOperators(pushGraphicsState(), setCharacterSpacing(spacing));
    for (const run of runs) {
      page.drawText(run.text, {
        x,
        y,
        size,
        font: run.font,
        color: opts.color,
      });
      x +=
        run.font.widthOfTextAtSize(run.text, size) +
        spacing * [...run.text].length;
    }
    page.pushOperators(popGraphicsState());
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
