import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import type { Donor } from '../donors/entities/donor.entity';

const PAGE = { width: 595, height: 842 }; // A4 Portrait

const IMAGE_EXTS = ['svg', 'png', 'webp', 'jpg', 'jpeg'] as const;

function numberToWords(num: number, currency: string): string {
  const isINR = currency.toUpperCase() === 'INR';
  const currencyName = isINR ? 'rupees' : currency;

  if (num === 0) return `zero ${currencyName} only`;

  const a = [
    '', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ',
    'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return `${num} ${currencyName} only`;

  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `${num} ${currencyName} only`;

  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';

  return str.trim() + ` ${currencyName} only`;
}

@Injectable()
export class DonationReceiptService {
  private readonly logger = new Logger(DonationReceiptService.name);

  private assetsDir() {
    return path.join(__dirname, '..', '..', 'assets');
  }

  private asset(...parts: string[]) {
    return path.join(this.assetsDir(), ...parts);
  }

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

  async buildPdf(donor: Donor): Promise<Buffer> {
    const regularFont = this.asset('fonts', 'Roboto-Regular.ttf');
    const boldFont = this.asset('fonts', 'Roboto-Bold.ttf');

    const [logoBuf, sealBuf] = await Promise.all([
      this.resolveImage('logo', 800),
      this.resolveImage('signature-stamp', 600).catch(() => this.resolveImage('seal', 600)), // Fallback to seal if they haven't saved it yet
    ]);

    const donorName = donor.fullName?.trim() || 'Donor';
    const amount = Number(donor.amount || 0);
    const dateStr = this.formatDateTime(donor.createdAt ?? new Date());
    const receiptNum = donor.receiptNumber || donor.razorpayPaymentId || '—';
    const city = donor.city?.trim() || '—';
    const pan = donor.pan?.trim() || '—';
    const amountWords = numberToWords(amount, donor.currency || 'INR');
    
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: [PAGE.width, PAGE.height],
        margin: 40,
        info: {
          Title: `Donation Receipt - ${donorName}`,
          Author: 'HCG Foundation',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.registerFont('Sans', regularFont);
      doc.registerFont('SansBold', boldFont);

      // Logo
      doc.image(logoBuf, 40, 40, { height: 50 });

      // Title
      doc.moveDown(4);
      doc.font('SansBold').fontSize(14).text('DONATION RECEIPT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`PAN-AAATH6254R`, { align: 'center' });
      
      doc.moveDown(1.5);
      doc.font('Sans').fontSize(11).text(
        `We confirm the receipt of donation from Mr/Mrs ${donorName} ONLINE Rs.${amount.toFixed(2)}/-`,
        { align: 'center' }
      );
      doc.moveDown(0.2);
      doc.text(`Dated ${dateStr}`, { align: 'center' });

      doc.moveDown(2);

      // Table Draw
      const tableTop = doc.y;
      const leftColX = 40;
      const rightColX = PAGE.width / 2;
      const rowHeight = 35;
      const colWidthLeft = PAGE.width / 2 - 40;
      const colWidthRight = PAGE.width / 2 - 40;

      const rows = [
        ['Receipt Number', String(receiptNum)],
        ['Total Donation', `INR ${amount.toFixed(2)}`],
        ['City', city],
        ['Receipt Date', dateStr],
        ['PAN/AADHAR Details of Donor', pan],
        ['Mode of Payment', 'ONLINE'],
        ['Amount in words', amountWords.toLowerCase()]
      ];

      doc.lineWidth(1).strokeColor('#000000');
      
      let currentY = tableTop;
      
      // Draw top border
      doc.moveTo(leftColX, currentY).lineTo(PAGE.width - 40, currentY).stroke();

      for (let i = 0; i < rows.length; i++) {
        const [label, value] = rows[i];
        
        // Draw vertical lines
        doc.moveTo(leftColX, currentY).lineTo(leftColX, currentY + rowHeight).stroke();
        doc.moveTo(rightColX, currentY).lineTo(rightColX, currentY + rowHeight).stroke();
        doc.moveTo(PAGE.width - 40, currentY).lineTo(PAGE.width - 40, currentY + rowHeight).stroke();

        // Text
        doc.font('Sans').fontSize(11).text(label, leftColX + 10, currentY + 12, { width: colWidthLeft - 20, align: 'left' });
        doc.font('Sans').text(value, rightColX + 10, currentY + 12, { width: colWidthRight - 20, align: 'left' });

        currentY += rowHeight;
        
        // Draw bottom border
        doc.moveTo(leftColX, currentY).lineTo(PAGE.width - 40, currentY).stroke();
      }

      doc.moveDown(2);

      // Note section
      doc.x = 40;
      doc.y = currentY + 30;
      
      // Dashed line
      doc.lineWidth(0.5).dash(3, { space: 3 }).moveTo(40, doc.y).lineTo(PAGE.width - 40, doc.y).stroke();
      doc.undash();
      
      doc.moveDown(1.5);
      doc.font('SansBold').fontSize(11).text('Note:');
      doc.moveDown(0.5);
      doc.font('Sans').fontSize(11).text(
        'Donation are eligible for 50% deduction from taxable income under section 80G(5)(vi) of the Income ' +
        'Tax Act 1961 Unique registration number AAATH6254RF20213 dated 24/09/2021, subject to ' +
        'realization of donation.',
        { width: PAGE.width - 80, align: 'left', lineGap: 3 }
      );

      doc.moveDown(3);
      
      // Authorized Signatory
      const authY = doc.y;
      doc.font('Sans').fontSize(11).text('Authorized Signatory', 40, authY);
      
      doc.image(sealBuf, 40, authY + 15, { height: 60 });

      doc.moveDown(5);
      doc.font('SansBold').fontSize(12).text('Thank you for your generosity. We appreciate your support!', 40, doc.y, { align: 'center', width: PAGE.width - 80 });

      // Footer
      const footerY = PAGE.height - 70; // Moved up slightly to prevent page break
      doc.font('Sans').fontSize(9).text('https://www.hcgfoundation.org', 40, footerY, { lineBreak: false });
      doc.font('Sans').text(
        'Ground Floor, Tower Block Unity Building Complex, Mission Road, Bangalore 560027, Karnataka, India', 
        200, footerY, 
        { width: PAGE.width - 240, align: 'right' }
      );

      doc.end();
    });
  }

  private formatDateTime(date: Date) {
    // 2026-06-22 06:49:07 format
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
