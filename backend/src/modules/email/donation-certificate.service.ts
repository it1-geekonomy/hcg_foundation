import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import type { Donor } from '../donors/entities/donor.entity';

/** A4 landscape in points */
const PAGE = { width: 842, height: 595 };

const NAVY = '#1A2744';
const LABEL = '#9AA3B2';
const MUTED = '#5C6578';
const RULE = '#D5DAE3';
const WAVE_BLUE = '#128ACB';
const WAVE_YELLOW = '#FAC647';
const WAVE_PINK = '#EE5488';

const IMAGE_EXTS = ['svg', 'png', 'webp', 'jpg', 'jpeg'] as const;

@Injectable()
export class DonationCertificateService {
  private readonly logger = new Logger(DonationCertificateService.name);

  private assetsDir() {
    return path.join(__dirname, '..', '..', 'assets');
  }

  private asset(...parts: string[]) {
    return path.join(this.assetsDir(), ...parts);
  }

  /** Prefer SVG → PNG → WebP → JPG. Rasterize SVG at high density. */
  private async resolveImage(
    basename: string,
    widthPx: number,
  ): Promise<Buffer> {
    for (const ext of IMAGE_EXTS) {
      const file = this.asset('certificates', `${basename}.${ext}`);
      if (!existsSync(file)) continue;

      try {
        const isVector = ext === 'svg';
        const img = sharp(file, { density: isVector ? 384 : 150 }).ensureAlpha();
        return await img
          .resize({
            width: widthPx,
            withoutEnlargement: !isVector,
            fit: 'inside',
          })
          .png()
          .toBuffer();
      } catch (err) {
        this.logger.warn(
          `Could not load ${file}: ${
            err instanceof Error ? err.message : 'unknown'
          }`,
        );
      }
    }
    throw new Error(
      `Missing certificate image "${basename}" (.svg/.png/.webp/.jpg) in assets/certificates`,
    );
  }

  private async resolveOptionalImage(
    basename: string,
    widthPx: number,
  ): Promise<Buffer | null> {
    try {
      if (!this.optionalImagePath(basename)) return null;
      return await this.resolveImage(basename, widthPx);
    } catch {
      return null;
    }
  }

  private optionalImagePath(basename: string) {
    for (const ext of IMAGE_EXTS) {
      const file = this.asset('certificates', `${basename}.${ext}`);
      if (existsSync(file)) return file;
    }
    return null;
  }

  async buildPdf(donor: Donor): Promise<Buffer> {
    const scriptFont = this.asset('fonts', 'GreatVibes-Regular.ttf');
    const signatureFont = this.asset('fonts', 'Allura-Regular.ttf');
    const regularFont = this.asset('fonts', 'Roboto-Regular.ttf');
    const boldFont = this.asset('fonts', 'Roboto-Bold.ttf');
    const titleFont = existsSync(this.asset('fonts', 'PlayfairDisplay-Bold.ttf'))
      ? this.asset('fonts', 'PlayfairDisplay-Bold.ttf')
      : boldFont;
    const titleRegular = existsSync(
      this.asset('fonts', 'PlayfairDisplay-Regular.ttf'),
    )
      ? this.asset('fonts', 'PlayfairDisplay-Regular.ttf')
      : regularFont;

    for (const file of [scriptFont, regularFont, boldFont]) {
      if (!existsSync(file)) {
        throw new Error(`Certificate font missing: ${file}`);
      }
    }

    const [logoBuf, sealBuf, watermarkBuf, bgBuf] = await Promise.all([
      this.resolveImage('logo', 1100),
      this.resolveImage('seal', 700),
      this.resolveOptionalImage('watermark', 1600),
      this.resolveOptionalImage('bg', 2400),
    ]);

    const signatureBuf = await this.resolveOptionalImage('signature', 500);

    const amountLabel = this.formatAmount(donor.amount, donor.currency);
    const dateLabel = this.formatDate(donor.createdAt ?? new Date());
    const donationFor = 'General Fund';
    const txnRef = donor.receiptNumber || donor.razorpayPaymentId || '—';
    const idCard = donor.pan?.trim() || '—';
    const donorName = donor.fullName?.trim() || 'Donor';

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: [PAGE.width, PAGE.height],
        margin: 0,
        info: {
          Title: `Donation Certificate - ${donorName}`,
          Author: 'HCG Foundation',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.registerFont('Script', scriptFont);
      doc.registerFont('Signature', existsSync(signatureFont) ? signatureFont : scriptFont);
      doc.registerFont('Sans', regularFont);
      doc.registerFont('SansBold', boldFont);
      doc.registerFont('SerifBold', titleFont);
      doc.registerFont('Serif', titleRegular);

      this.drawPaper(doc, bgBuf);
      if (watermarkBuf) {
        this.drawWatermarkImage(doc, watermarkBuf);
      } else {
        this.drawWatermarkWaves(doc);
      }
      this.drawTopRightAccent(doc);

      // Header — crisp SVG logo + seal
      doc.image(logoBuf, 40, 28, { height: 62 });
      doc.image(sealBuf, PAGE.width - 122, 18, { width: 86 });

      // Title block (serif like Figma)
      doc
        .fillColor(NAVY)
        .font('SerifBold')
        .fontSize(30)
        .text('DONATION CERTIFICATE', 70, 108, {
          width: PAGE.width - 140,
          align: 'center',
        });

      doc
        .font('Serif')
        .fontSize(12)
        .fillColor(NAVY)
        .text('OF APPRECIATION', 70, 144, {
          width: PAGE.width - 140,
          align: 'center',
          characterSpacing: 3,
        });

      doc
        .strokeColor(RULE)
        .lineWidth(0.9)
        .moveTo(PAGE.width / 2 - 78, 168)
        .lineTo(PAGE.width / 2 + 78, 168)
        .stroke();

      doc
        .font('Sans')
        .fontSize(9)
        .fillColor(LABEL)
        .text('THIS IS TO CERTIFY THAT', 70, 184, {
          width: PAGE.width - 140,
          align: 'center',
          characterSpacing: 1.8,
        });

      // Donor name
      const nameY = 208;
      doc
        .font('Script')
        .fontSize(44)
        .fillColor(NAVY)
        .text(donorName, 90, nameY, {
          width: PAGE.width - 180,
          align: 'center',
        });

      // Soft underline under name
      const nameWidth = Math.min(
        280,
        doc.widthOfString(donorName) * 0.55 + 80,
      );
      doc
        .strokeColor(RULE)
        .lineWidth(0.7)
        .moveTo(PAGE.width / 2 - nameWidth / 2, nameY + 52)
        .lineTo(PAGE.width / 2 + nameWidth / 2, nameY + 52)
        .stroke();

      doc
        .font('Sans')
        .fontSize(10.5)
        .fillColor(MUTED)
        .text(
          'In Grateful Appreciation Of Your Generous Contribution Towards Creating A Cancer-Free Tomorrow.',
          110,
          268,
          { width: PAGE.width - 220, align: 'center', lineGap: 2 },
        );

      this.drawDetailsRow(doc, [
        { label: 'DONATION AMOUNT', value: amountLabel },
        { label: 'DONATION DATE', value: dateLabel },
        { label: 'DONATION FOR', value: donationFor },
        { label: 'TRANSACTION REFERENCE NO.', value: String(txnRef) },
        { label: 'PAN / AADHAAR NO', value: idCard },
      ]);

      // Waves first so seals/signatures sit on top of them
      this.drawWaves(doc);

      // Bottom-left seal
      doc.image(sealBuf, 58, PAGE.height - 168, { width: 72 });
      doc
        .font('Sans')
        .fontSize(8.5)
        .fillColor(NAVY)
        .text('Authorized Signatory', 48, PAGE.height - 88, {
          width: 92,
          align: 'center',
        });
      doc
        .font('SansBold')
        .fontSize(9.5)
        .text('HCG Foundation', 48, PAGE.height - 74, {
          width: 92,
          align: 'center',
        });

      // Bottom-right signature
      const sigX = PAGE.width - 230;
      const sigLineY = PAGE.height - 118;
      if (signatureBuf) {
        doc.image(signatureBuf, sigX + 10, sigLineY - 42, {
          width: 120,
          height: 44,
          fit: [120, 44],
        });
      } else {
        doc
          .font('Signature')
          .fontSize(28)
          .fillColor(NAVY)
          .text('Jaisen', sigX, sigLineY - 38, {
            width: 140,
            align: 'center',
          });
      }

      doc
        .strokeColor(NAVY)
        .lineWidth(0.8)
        .moveTo(sigX, sigLineY)
        .lineTo(sigX + 140, sigLineY)
        .stroke();

      doc
        .font('Sans')
        .fontSize(8.5)
        .fillColor(NAVY)
        .text('Authorized Signatory', sigX, sigLineY + 8, {
          width: 140,
          align: 'center',
        });
      doc
        .font('SansBold')
        .fontSize(9.5)
        .fillColor(NAVY)
        .text('HCG Foundation', sigX, sigLineY + 22, {
          width: 140,
          align: 'center',
        });

      doc
        .font('Sans')
        .fontSize(9)
        .fillColor('#FFFFFF')
        .text('www.hcgfoundation.org', 0, PAGE.height - 28, {
          width: PAGE.width,
          align: 'center',
        });

      doc.end();
    });
  }

  private drawPaper(doc: PDFKit.PDFDocument, bgBuf: Buffer | null) {
    // Figma: cream / security-paper texture — not pure white
    if (bgBuf) {
      doc.image(bgBuf, 0, 0, {
        width: PAGE.width,
        height: PAGE.height,
      });
      return;
    }
    doc.rect(0, 0, PAGE.width, PAGE.height).fill('#F7F4EC');
  }

  private drawWatermarkImage(doc: PDFKit.PDFDocument, buf: Buffer) {
    doc.save();
    // Figma asset already includes ~0.08 opacity; keep light so text stays readable
    doc.opacity(0.55);
    const w = 420;
    const h = 360;
    doc.image(buf, (PAGE.width - w) / 2, (PAGE.height - h) / 2 - 20, {
      width: w,
      height: h,
      fit: [w, h],
    });
    doc.restore();
  }

  /** Soft pastel ribbon watermarks (fallback when watermark.svg is missing). */
  private drawWatermarkWaves(doc: PDFKit.PDFDocument) {
    doc.save();
    doc.opacity(0.07);
    const ribbons: Array<{ color: string; path: string }> = [
      {
        color: WAVE_BLUE,
        path: 'M -40 180 C 120 80, 220 260, 380 160 C 520 80, 620 220, 900 120 L 900 200 C 620 280, 500 160, 360 240 C 200 330, 80 220, -40 260 Z',
      },
      {
        color: WAVE_PINK,
        path: 'M -40 320 C 140 240, 260 400, 420 300 C 560 220, 700 380, 900 280 L 900 360 C 700 440, 540 300, 400 380 C 240 470, 80 360, -40 400 Z',
      },
      {
        color: WAVE_YELLOW,
        path: 'M 200 40 C 320 0, 420 90, 560 40 C 680 0, 760 70, 900 30 L 900 90 C 760 130, 660 50, 540 100 C 400 150, 300 60, 200 100 Z',
      },
    ];
    for (const ribbon of ribbons) {
      doc.fillColor(ribbon.color).path(ribbon.path).fill();
    }
    doc.restore();
  }

  private drawTopRightAccent(doc: PDFKit.PDFDocument) {
    doc.save();
    doc.opacity(0.35);
    doc
      .fillColor(WAVE_PINK)
      .path(
        'M 680 -10 C 740 40, 790 20, 860 90 L 860 -10 Z',
      )
      .fill();
    doc.opacity(0.28);
    doc
      .fillColor(WAVE_YELLOW)
      .path('M 720 -10 C 780 50, 820 30, 860 70 L 860 -10 Z')
      .fill();
    doc.restore();
  }

  private drawDetailsRow(
    doc: PDFKit.PDFDocument,
    items: Array<{ label: string; value: string }>,
  ) {
    const top = 310;
    const left = 40;
    const right = PAGE.width - 40;
    const width = right - left;
    const colW = width / items.length;

    items.forEach((item, i) => {
      const x = left + i * colW;
      if (i > 0) {
        doc
          .strokeColor(RULE)
          .lineWidth(0.55)
          .moveTo(x, top + 2)
          .lineTo(x, top + 48)
          .stroke();
      }
      doc
        .font('Sans')
        .fontSize(7)
        .fillColor(LABEL)
        .text(item.label, x + 8, top, {
          width: colW - 16,
          align: 'center',
          characterSpacing: 0.35,
        });
      doc
        .font('SansBold')
        .fontSize(10.5)
        .fillColor(NAVY)
        .text(item.value, x + 6, top + 20, {
          width: colW - 12,
          align: 'center',
        });
    });
  }

  /** Original stacked full-width waves: blue → yellow → pink */
  private drawWaves(doc: PDFKit.PDFDocument) {
    const baseY = PAGE.height - 78;
    const layers: Array<{ color: string; y: number }> = [
      { color: WAVE_BLUE, y: baseY },
      { color: WAVE_YELLOW, y: baseY + 18 },
      { color: WAVE_PINK, y: baseY + 36 },
    ];

    for (const layer of layers) {
      doc.save();
      doc.fillColor(layer.color);
      doc
        .moveTo(0, PAGE.height)
        .lineTo(0, layer.y + 20)
        .bezierCurveTo(
          PAGE.width * 0.2,
          layer.y - 18,
          PAGE.width * 0.35,
          layer.y + 40,
          PAGE.width * 0.5,
          layer.y + 8,
        )
        .bezierCurveTo(
          PAGE.width * 0.65,
          layer.y - 22,
          PAGE.width * 0.8,
          layer.y + 36,
          PAGE.width,
          layer.y + 6,
        )
        .lineTo(PAGE.width, PAGE.height)
        .closePath()
        .fill();
      doc.restore();
    }
  }

  private formatAmount(amount: string | number, currency: string) {
    const n = Number(amount);
    const formatted = Number.isFinite(n)
      ? n.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')
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
    const symbol = symbols[currency] ?? `${currency} `;
    return `${symbol}${formatted}`;
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
