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
          `Could not load ${file}: ${err instanceof Error ? err.message : 'unknown'
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

    const [logoBuf, sealBuf, watermarkBuf] = await Promise.all([
      this.resolveImage('logo', 800),
      this.resolveImage('signature-stamp', 600).catch(() => this.resolveImage('seal', 600)),
      this.resolveImage('watermark', 800).catch(() => null),
    ]);

    const donorName = donor.fullName?.trim() || 'Donor';
    const amount = Number(donor.amount || 0);
    const dateStr = this.formatDateTime(donor.createdAt ?? new Date());
    const receiptNum = donor.receiptNumber || donor.razorpayPaymentId || '—';
    const city = donor.city?.trim() || '—';
    const pan = donor.pan?.trim() || '—';
    const amountWords = numberToWords(amount, donor.currency || 'INR');

    const CYAN_BAR = '#2fb7ec';
    const YELLOW_BAR = '#ffb81c';
    const PINK_BAR = '#e63888';

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: [PAGE.width, PAGE.height],
        margin: 0,
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

      // Top color bar
      doc.rect(0, 0, PAGE.width / 3, 5).fill(CYAN_BAR);
      doc.rect(PAGE.width / 3, 0, PAGE.width / 3, 5).fill(YELLOW_BAR);
      doc.rect((PAGE.width / 3) * 2, 0, PAGE.width / 3, 5).fill(PINK_BAR);

      // Background watermark
      if (watermarkBuf) {
        doc.save();
        doc.image(watermarkBuf, (PAGE.width - 500) / 2, (PAGE.height - 450) / 2, { width: 500 });
        doc.restore();
      }

      // Logo
      const logoWidth = 140;
      doc.image(logoBuf, (PAGE.width - logoWidth) / 2, 40, { width: logoWidth });

      doc.y = 110;
      // Title
      doc.font('Times-Roman').fillColor('#101b4d').fontSize(22).text('DONATION RECEIPT', { align: 'center', characterSpacing: 1.5 });
      doc.moveDown(0.3);
      doc.font('Sans').fillColor('#333333').fontSize(9).text(`PAN-AAATH6254R`, { align: 'center', characterSpacing: 1 });

      doc.moveDown(2);
      
      const text1 = 'We Confirm The Receipt Of Donation From ';
      const text2 = `Mr/Mrs ${donorName}`;
      doc.font('Sans').fontSize(10);
      const w1 = doc.widthOfString(text1);
      doc.font('SansBold').fontSize(10);
      const w2 = doc.widthOfString(text2);
      const startX1 = (PAGE.width - (w1 + w2)) / 2;
      
      doc.font('Sans').fillColor('#555555').text(text1, startX1, doc.y, { lineBreak: false });
      doc.font('SansBold').fillColor('#2b3e71').text(text2, startX1 + w1, doc.y);

      doc.moveDown(0.5);

      const text3 = `ONLINE ₹${amount.toFixed(2)}/- `;
      const text4 = `Dated ${dateStr}`;
      doc.font('SansBold').fontSize(10);
      const w3 = doc.widthOfString(text3);
      doc.font('Sans').fontSize(10);
      const w4 = doc.widthOfString(text4);
      const startX2 = (PAGE.width - (w3 + w4)) / 2;

      doc.font('SansBold').fillColor('#2b3e71').text(text3, startX2, doc.y, { lineBreak: false });
      doc.font('Sans').fillColor('#555555').text(text4, startX2 + w3, doc.y);

      // Table Draw
      const tableTop = doc.y + 20;
      let currentY = tableTop;
      const tableX = 50;
      const tableW = PAGE.width - 100;

      const rows = [
        ['Receipt Number', String(receiptNum)],
        ['Total Donation', `₹${amount.toFixed(2)}`],
        ['City', city],
        ['Receipt Date', dateStr],
        ['PAN/AADHAR Details Of Donor', pan],
        ['Mode Of Payment', 'ONLINE'],
        ['Amount In Words', amountWords.replace(/\b\w/g, l => l.toUpperCase())]
      ];

      doc.lineWidth(0.5).strokeColor('#e0e0e0');

      for (let i = 0; i < rows.length; i++) {
        const [label, value] = rows[i];
        
        doc.font('Sans').fontSize(10);
        const valHeight = doc.heightOfString(value, { width: tableW - 260 });
        const labHeight = doc.heightOfString(label, { width: 170 });
        const currentRowHeight = Math.max(35, valHeight + 20, labHeight + 20);

        if (i > 0) {
          doc.moveTo(tableX, currentY).lineTo(tableX + tableW, currentY).stroke();
        }

        doc.fillColor('#333333');
        doc.text(label, tableX + 20, currentY + (currentRowHeight - labHeight) / 2, { width: 170 });
        doc.text(':', tableX + 200, currentY + (currentRowHeight - doc.heightOfString(':')) / 2, { width: 10 });
        doc.text(value, tableX + 240, currentY + (currentRowHeight - valHeight) / 2, { width: tableW - 260 });

        currentY += currentRowHeight;
      }
      
      // Outer box
      doc.rect(tableX, tableTop, tableW, currentY - tableTop).stroke();

      // Note section
      currentY += 30;
      const noteH = 90;
      
      doc.rect(tableX, currentY, tableW, noteH).fillAndStroke('#fdf7f2', '#f3e6d8');
      
      // Info icon
      doc.circle(tableX + 20, currentY + 17, 6).fill('#d4a135');
      doc.fillColor('#ffffff').font('SansBold').fontSize(8).text('i', tableX + 18.8, currentY + 13);
      
      doc.fillColor('#000000').font('SansBold').fontSize(9).text('Note:', tableX + 32, currentY + 12);
      
      const noteText = 'Donation Are Eligible For 50% Deduction From Taxable Income Under Section 80G(5)(Vi) Of The Income ' +
        'Tax Act 1961 Unique Registration Number AAATH6254RF20213 Dated 24/09/2021, Subject To ' +
        'Realization Of Donation.';
        
      doc.font('Sans').fillColor('#555555').fontSize(9).text(noteText, tableX + 20, currentY + 30, {
        width: tableW - 40,
        lineGap: 3,
        align: 'justify'
      });

      // Signature area
      currentY += noteH + 40;
      
      // Left side: Seal/Signature
      doc.image(sealBuf, tableX - 5, currentY, { height: 120 });
      doc.font('Sans').fillColor('#333333').fontSize(10).text('Authorized Signatory', tableX, currentY + 120);
      
      // Right side
      const rightMsgX = PAGE.width - tableX - 170;
      doc.moveTo(rightMsgX, currentY + 100).lineTo(rightMsgX, currentY + 135).lineWidth(1.5).strokeColor('#e63888').stroke();
      
      doc.font('Sans').fillColor('#111111').fontSize(10).text('Thank You For Your Generosity.', rightMsgX + 10, currentY + 105);
      doc.text('We Appreciate Your Support!', rightMsgX + 10, currentY + 120);

      // Footer
      const footerY = PAGE.height - 40;
      
      doc.font('Sans').fillColor('#888888').fontSize(7.5);
      
      // Website
      const globePath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z";
      doc.save().translate(tableX + 4, footerY + 0.5).scale(0.35).path(globePath).fill('#888888', 'even-odd').restore();
      doc.text('www.hcgfoundation.org', tableX + 15, footerY);
      
      // Address
      const mapPinPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z";
      const addressText = 'Ground floor, Tower block unity building complex, Mission road, Bangalore 560027, Karnataka, India.';
      const addressX = 240;
      
      doc.save().translate(addressX + 4, footerY + 0.5).scale(0.35).path(mapPinPath).fill('#888888', 'even-odd').restore();
      
      doc.text(
        addressText,
        addressX + 15, footerY,
        { lineBreak: false }
      );

      // Bottom color bar
      doc.rect(0, PAGE.height - 5, PAGE.width / 3, 5).fill(CYAN_BAR);
      doc.rect(PAGE.width / 3, PAGE.height - 5, PAGE.width / 3, 5).fill(YELLOW_BAR);
      doc.rect((PAGE.width / 3) * 2, PAGE.height - 5, PAGE.width / 3, 5).fill(PINK_BAR);

      doc.end();
    });
  }

  private formatDateTime(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(hours)}:${pad(date.getMinutes())} ${ampm}`;
  }
}
