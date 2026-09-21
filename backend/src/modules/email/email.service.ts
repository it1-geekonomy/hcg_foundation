import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Donor } from '../donors/entities/donor.entity';
import { DonationCertificateService } from './donation-certificate.service';
import { DonationReceiptService } from './donation-receipt.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  constructor(
    private readonly certificates: DonationCertificateService,
    private readonly receipts: DonationReceiptService
  ) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not defined. Donation emails will not be sent.',
      );
      return;
    }
    this.resend = new Resend(apiKey);
  }

  async sendDonationReceipt(donor: Donor): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `Skipping donation receipt for ${donor.email} because RESEND_API_KEY is missing.`,
      );
      return;
    }

    if (!donor.email) {
      this.logger.warn(
        'Skipping donation receipt because donor provided no email.',
      );
      return;
    }

    let certPdf: Buffer;
    let receiptPdf: Buffer;
    try {
      [certPdf, receiptPdf] = await Promise.all([
        this.certificates.buildPdf(donor),
        this.receipts.buildPdf(donor),
      ]);
    } catch (err) {
      this.logger.error(
        `Could not build donation PDFs: ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
      );
      certPdf = Buffer.alloc(0);
      receiptPdf = Buffer.alloc(0);
    }

    const amountLabel = this.formatAmount(donor.amount, donor.currency);
    const receipt = donor.receiptNumber || '—';
    const dateLabel = new Date(donor.createdAt ?? Date.now()).toLocaleDateString(
      'en-IN',
      { day: '2-digit', month: 'short', year: 'numeric' },
    );
    const certFilename = `HCG-Donation-Certificate-${receipt}.pdf`;
    const receiptFilename = `HCG-Donation-Receipt-${receipt}.pdf`;
    const hasPdf = certPdf.length > 0 && receiptPdf.length > 0;

    try {
      const attachments = hasPdf
        ? [
            { filename: certFilename, content: certPdf.toString('base64') },
            { filename: receiptFilename, content: receiptPdf.toString('base64') }
          ]
        : undefined;

      const { data, error } = await this.resend.emails.send({
        from: `HCG Foundation <${this.fromEmail}>`,
        to: [donor.email],
        subject: 'Thank you for your donation — HCG Foundation',
        html: this.buildDonationEmailHtml({
          fullName: donor.fullName,
          amountLabel,
          receipt,
          dateLabel,
          hasPdf,
        }),
        attachments,
      });

      if (error) {
        this.logger.error(
          `Failed to send receipt to ${donor.email}: ${error.message}`,
        );
        return;
      }

      this.logger.log(
        `Donation receipt + certificate sent to ${donor.email} (ID: ${data?.id})`,
      );
    } catch (err) {
      this.logger.error(
        `Error sending email to ${donor.email}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      );
    }
  }

  private buildDonationEmailHtml(params: {
    fullName: string;
    amountLabel: string;
    receipt: string;
    dateLabel: string;
    hasPdf: boolean;
  }) {
    const name = this.escape(params.fullName);
    const amount = this.escape(params.amountLabel);
    const receipt = this.escape(params.receipt);
    const date = this.escape(params.dateLabel);
    const certNote = params.hasPdf
      ? 'Your official <strong>Donation Certificate of Appreciation</strong> and <strong>Donation Receipt</strong> are attached as PDFs. Please keep them for your records.'
      : 'Your donation has been recorded. If you need a certificate or receipt copy, reply to this email and we will gladly help.';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thank you for your donation</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F5F7;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(26,39,68,0.08);">

          <!-- Brand bar -->
          <tr>
            <td style="background:#1A2744;padding:22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:0.4px;">
                    HCG <span style="color:#FAC647;">FOUNDATION</span>
                  </td>
                  <td align="right" style="font-size:12px;color:#A8B3C7;">
                    Lasting inspirations
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent stripe -->
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,#128ACB 0%,#FAC647 50%,#EE5488 100%);">
              &nbsp;
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 8px 28px;">
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#9AA3B2;">
                Donation confirmed
              </p>
              <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.25;font-weight:700;color:#1A2744;">
                Thank you, ${name}
              </h1>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#5C6578;">
                We have successfully received your generous contribution.
                Your support helps us bring care, hope, and a cancer-free tomorrow to those who need it most.
              </p>
            </td>
          </tr>

          <!-- Amount highlight -->
          <tr>
            <td style="padding:0 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF8E1;border:1px solid #F5E6A8;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8A7A28;">
                      Amount donated
                    </p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#1A2744;">
                      ${amount}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#1A2744;">
                      Receipt details
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#8A93A5;border-bottom:1px solid #E6E9EF;">Receipt number</td>
                        <td align="right" style="padding:8px 0;font-size:13px;font-weight:600;color:#1A2744;border-bottom:1px solid #E6E9EF;">${receipt}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#8A93A5;border-bottom:1px solid #E6E9EF;">Date</td>
                        <td align="right" style="padding:8px 0;font-size:13px;font-weight:600;color:#1A2744;border-bottom:1px solid #E6E9EF;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#8A93A5;">Donation for</td>
                        <td align="right" style="padding:8px 0;font-size:13px;font-weight:600;color:#1A2744;">General Fund</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Certificate note -->
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #128ACB;background:#F0F8FD;border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.55;color:#1A2744;">
                    ${certNote}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 28px 32px 28px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#5C6578;">
                With gratitude,<br />
                <strong style="color:#1A2744;">The HCG Foundation Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1A2744;padding:20px 28px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:13px;color:#FFFFFF;">
                <a href="https://www.hcgfoundation.org" style="color:#FAC647;text-decoration:none;font-weight:600;">www.hcgfoundation.org</a>
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:#8A93A5;">
                People. Care. Possibilities.<br />
                This is an automated receipt for your donation.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private formatAmount(amount: string | number, currency: string) {
    const n = Number(amount);
    const formatted = Number.isFinite(n)
      ? n.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')
      : String(amount);
    const symbols: Record<string, string> = {
      INR: '₹',
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

  private escape(value: string) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
