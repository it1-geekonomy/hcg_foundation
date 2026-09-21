import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Donor } from '../donors/entities/donor.entity';

const NAVY = rgb(0x1a / 255, 0x27 / 255, 0x44 / 255);

@Injectable()
export class DonationCertificateService {
  private readonly logger = new Logger(DonationCertificateService.name);

  private assetsDir() {
    return path.join(__dirname, '..', '..', 'assets');
  }

  private asset(...parts: string[]) {
    return path.join(this.assetsDir(), ...parts);
  }

  /**
   * Uses the Word-exported `certificate-base.pdf` (exact layout from
   * Donation Certficate.docx) and only stamps donor fields on top.
   */
  async buildCertificate(donor: Donor): Promise<Buffer> {
    return this.buildPdf(donor);
  }

  async buildPdf(donor: Donor): Promise<Buffer> {
    const basePath = this.asset('certificates', 'certificate-base.pdf');
    if (!existsSync(basePath)) {
      throw new Error(
        `Missing ${basePath}. Run: pnpm run certificate:base (requires Microsoft Word)`,
      );
    }

    const pdf = await PDFDocument.load(readFileSync(basePath));
    pdf.registerFontkit(fontkit);

    const page = pdf.getPages()[0];
    const { width, height } = page.getSize();

    const scriptPath = this.asset('fonts', 'GreatVibes-Regular.ttf');
    const boldPath = this.asset('fonts', 'Roboto-Bold.ttf');
    const scriptFont = existsSync(scriptPath)
      ? await pdf.embedFont(readFileSync(scriptPath))
      : await pdf.embedFont(StandardFonts.TimesRomanItalic);
    const boldFont = existsSync(boldPath)
      ? await pdf.embedFont(readFileSync(boldPath))
      : await pdf.embedFont(StandardFonts.HelveticaBold);

    const donorName = donor.fullName?.trim() || 'Donor';
    const amountLabel = this.formatAmount(donor.amount, donor.currency);
    const dateLabel = this.formatDate(donor.createdAt ?? new Date());
    const donationFor = 'General Fund';
    const txnRef = String(donor.receiptNumber || donor.razorpayPaymentId || '—');
    const idCard = donor.pan?.trim() || '—';

    // Landscape A4 — positions calibrated to Word → certificate-base.pdf
    const nameSize = 36;
    const nameWidth = scriptFont.widthOfTextAtSize(donorName, nameSize);
    page.drawText(donorName, {
      x: (width - nameWidth) / 2,
      y: height - 268,
      size: nameSize,
      font: scriptFont,
      color: NAVY,
    });

    const valueSize = 11;
    // Column centers under the 5 labels (measured from Word → PDF export)
    const colCenters = [102, 234, 382, 542, 712];
    const valueY = height - 429;
    const values = [amountLabel, dateLabel, donationFor, txnRef, idCard];

    // Cover sample "General Fund" printed in the Word export (3rd column)
    const paper = rgb(246 / 255, 246 / 255, 246 / 255);
    page.drawRectangle({
      x: 325,
      y: valueY - 2,
      width: 100,
      height: 15,
      color: paper,
    });

    values.forEach((value, i) => {
      const w = boldFont.widthOfTextAtSize(value, valueSize);
      page.drawText(value, {
        x: colCenters[i] - w / 2,
        y: valueY,
        size: valueSize,
        font: boldFont,
        color: NAVY,
      });
    });

    const bytes = await pdf.save();
    return Buffer.from(bytes);
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
    return `${symbols[currency] ?? `${currency} `}${formatted}`;
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
