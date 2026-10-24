import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { DonationCategory } from '../../common/enums/donation-category.enum';
import { Donor } from '../donors/entities/donor.entity';
import { FundraisingCampaign } from '../fundraising-campaigns/entities/fundraising-campaign.entity';
import { LeadsContact } from '../leads-contact/entities/leads-contact.entity';
import { LeadsInternship } from '../leads-internship/entities/leads-internship.entity';
import { Volunteer } from '../volunteer/entities/volunteer.entity';
import { DonationCertificateService } from './donation-certificate.service';
import { DonationReceiptService } from './donation-receipt.service';

export type QuotaScope = 'daily' | 'monthly' | 'rate';

export type ReceiptEmailResult =
  | { status: 'sent'; id?: string }
  | { status: 'skipped'; reason: string }
  | { status: 'quota'; scope: QuotaScope }
  | { status: 'error'; message: string };

export interface FormSubmissionDetail {
  label: string;
  value?: string | number | boolean | null;
}

export interface FormSubmissionNotificationParams {
  formType: 'Fundraise' | 'Volunteer' | 'Intern' | 'Contact Us';
  details: FormSubmissionDetail[];
  cvLink?: string | null;
  submittedAt?: Date | string;
  submissionId?: string;
}

export type NotificationEmailResult =
  | { status: 'sent'; id?: string }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; message: string };

const QUOTA_ERRORS: Partial<Record<string, QuotaScope>> = {
  daily_quota_exceeded: 'daily',
  monthly_quota_exceeded: 'monthly',
  rate_limit_exceeded: 'rate',
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  constructor(
    private readonly certificates: DonationCertificateService,
    private readonly receipts: DonationReceiptService,
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

  isEnabled(): boolean {
    return this.resend !== null;
  }

  async sendDonationReceipt(donor: Donor): Promise<ReceiptEmailResult> {
    if (!this.resend) {
      this.logger.warn(
        `Skipping donation receipt for ${donor.email} because RESEND_API_KEY is missing.`,
      );
      return { status: 'skipped', reason: 'RESEND_API_KEY is missing' };
    }

    if (!donor.email) {
      this.logger.warn(
        'Skipping donation receipt because donor provided no email.',
      );
      return { status: 'skipped', reason: 'Donor provided no email' };
    }

    let certPdf: Buffer = Buffer.alloc(0);
    let receiptPdf: Buffer | null = null;
    try {
      const [cert, receipt] = await Promise.all([
        this.certificates.buildPdf(donor),
        donor.pan ? this.receipts.buildPdf(donor) : Promise.resolve(null),
      ]);
      certPdf = cert;
      receiptPdf = receipt;
    } catch (err) {
      this.logger.error(
        `Could not build donation PDFs: ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
      );
    }

    const amountLabel = this.formatAmount(donor.amount, donor.currency);
    const receipt = donor.receiptNumber || '—';
    const dateLabel = new Date(
      donor.createdAt ?? Date.now(),
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
    const certFilename = `HCG-Donation-Certificate-${receipt}.pdf`;
    const receiptFilename = `HCG-Donation-Receipt-${receipt}.pdf`;

    const attachments: { filename: string; content: string }[] = [];
    if (certPdf.length > 0) {
      attachments.push({
        filename: certFilename,
        content: certPdf.toString('base64'),
      });
    }
    const hasReceiptPdf = receiptPdf && receiptPdf.length > 0;
    if (hasReceiptPdf) {
      attachments.push({
        filename: receiptFilename,
        content: receiptPdf!.toString('base64'),
      });
    }
    const hasPdf = attachments.length > 0;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `HCG Foundation <${this.fromEmail}>`,
        to: [donor.email],
        subject: 'Thank you for your donation — HCG Foundation',
        html: this.buildDonationEmailHtml({
          fullName: donor.fullName,
          amountLabel,
          receipt,
          dateLabel,
          category: donor.donationCategory || DonationCategory.GENERAL_FUNDS,
          hasPdf,
          hasReceiptPdf: !!hasReceiptPdf,
        }),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (error) {
        const quota = QUOTA_ERRORS[error.name];
        if (quota) {
          this.logger.warn(
            `Resend ${quota} limit reached; receipt for ${donor.email} stays queued (${error.message})`,
          );
          return { status: 'quota', scope: quota };
        }
        this.logger.error(
          `Failed to send receipt to ${donor.email}: ${error.message}`,
        );
        return { status: 'error', message: `${error.name}: ${error.message}` };
      }

      this.logger.log(
        `Donation receipt + certificate sent to ${donor.email} (ID: ${data?.id})`,
      );
      return { status: 'sent', id: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error sending email to ${donor.email}: ${message}`);
      return { status: 'error', message };
    }
  }

  private buildDonationEmailHtml(params: {
    fullName: string;
    amountLabel: string;
    receipt: string;
    dateLabel: string;
    category: string;
    hasPdf: boolean;
    hasReceiptPdf: boolean;
  }) {
    const name = this.escape(params.fullName);
    const category = this.escape(params.category);
    const amount = this.escape(params.amountLabel);
    const receipt = this.escape(params.receipt);
    const date = this.escape(params.dateLabel);

    let certNote =
      'Your donation has been recorded. If you need a certificate or receipt copy, reply to this email and we will gladly help.';
    if (params.hasPdf) {
      if (params.hasReceiptPdf) {
        certNote =
          'Your official <strong>Donation Certificate of Appreciation</strong> and <strong>80G Donation Receipt</strong> are attached as PDFs. Please keep them for your records.';
      } else {
        certNote =
          'Your official <strong>Donation Certificate of Appreciation</strong> is attached as a PDF. Please keep it for your records.';
      }
    }

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
                        <td align="right" style="padding:8px 0;font-size:13px;font-weight:600;color:#1A2744;">${category}</td>
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

  async sendFundraisingNotification(
    campaign: FundraisingCampaign,
  ): Promise<NotificationEmailResult> {
    return this.sendFormNotificationEmail({
      formType: 'Fundraise',
      submissionId: campaign.id,
      submittedAt: campaign.createdAt,
      details: [
        { label: 'Full Name', value: campaign.fullName },
        { label: 'Email', value: campaign.email },
        { label: 'Phone Number', value: campaign.phoneNumber },
        { label: 'City', value: campaign.city },
        {
          label: 'Fundraising Goal',
          value: campaign.fundraisingGoal
            ? `₹${campaign.fundraisingGoal}`
            : campaign.fundraisingGoal,
        },
        { label: 'Fundraising Reason', value: campaign.fundraisingReason },
        { label: 'Message', value: campaign.message || '—' },
        { label: 'Status', value: campaign.status },
      ],
    });
  }

  async sendVolunteerNotification(
    volunteer: Volunteer,
  ): Promise<NotificationEmailResult> {
    return this.sendFormNotificationEmail({
      formType: 'Volunteer',
      submissionId: volunteer.id,
      submittedAt: volunteer.createdAt,
      details: [
        { label: 'Full Name', value: volunteer.fullName },
        { label: 'Email', value: volunteer.email },
        { label: 'Phone', value: volunteer.phone },
        { label: 'City / Location', value: volunteer.cityLocation },
        {
          label: 'Educational Qualification',
          value: volunteer.educationalQualification,
        },
        { label: 'Areas of Interest', value: volunteer.areasOfInterest },
        { label: 'Reason for Volunteering', value: volunteer.reason },
      ],
    });
  }

  async sendInternshipNotification(
    internship: LeadsInternship,
  ): Promise<NotificationEmailResult> {
    return this.sendFormNotificationEmail({
      formType: 'Intern',
      submissionId: internship.id,
      submittedAt: internship.createdAt,
      cvLink: internship.cv,
      details: [
        { label: 'Full Name', value: internship.fullName },
        { label: 'Email', value: internship.email || '—' },
        { label: 'Phone', value: internship.phone || '—' },
        { label: 'Gender', value: internship.gender || '—' },
        { label: 'Date of Birth', value: internship.dob || '—' },
        { label: 'Current Course', value: internship.currentCourse || '—' },
        { label: 'Address', value: internship.address || '—' },
        { label: 'Languages', value: internship.languages || '—' },
        { label: 'Computer Skills', value: internship.computerSkills || '—' },
        { label: 'Message', value: internship.message || '—' },
      ],
    });
  }

  async sendContactNotification(
    contact: LeadsContact,
  ): Promise<NotificationEmailResult> {
    return this.sendFormNotificationEmail({
      formType: 'Contact Us',
      submissionId: contact.id,
      submittedAt: contact.createdAt,
      details: [
        { label: 'Full Name', value: contact.fullName },
        { label: 'Email', value: contact.email || '—' },
        { label: 'Phone', value: contact.phone || '—' },
        { label: 'Message', value: contact.message || '—' },
      ],
    });
  }

  private async sendFormNotificationEmail(
    params: FormSubmissionNotificationParams,
  ): Promise<NotificationEmailResult> {
    const recipient =
      process.env.SUBMISSION_NOTIFICATION_EMAIL || 'pcc.hcgf@hcgel.com';

    if (!this.resend) {
      this.logger.warn(
        `Skipping ${params.formType} submission notification to ${recipient} because RESEND_API_KEY is missing.`,
      );
      return { status: 'skipped', reason: 'RESEND_API_KEY is missing' };
    }

    try {
      const subject = `New ${params.formType} Form Submission — HCG Foundation`;
      const html = this.buildFormSubmissionEmailHtml(params);

      const { data, error } = await this.resend.emails.send({
        from: `HCG Foundation <${this.fromEmail}>`,
        to: [recipient],
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send ${params.formType} notification to ${recipient}: ${error.name} - ${error.message}`,
        );
        return { status: 'error', message: `${error.name}: ${error.message}` };
      }

      this.logger.log(
        `Form notification for ${params.formType} sent to ${recipient} (ID: ${data?.id})`,
      );
      return { status: 'sent', id: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Error sending ${params.formType} notification to ${recipient}: ${message}`,
      );
      return { status: 'error', message };
    }
  }

  private buildFormSubmissionEmailHtml(
    params: FormSubmissionNotificationParams,
  ): string {
    const formType = this.escape(params.formType);
    const dateLabel = new Date(params.submittedAt ?? Date.now()).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      },
    );

    const rowsHtml = params.details
      .map((detail) => {
        const label = this.escape(detail.label);
        let rawVal = detail.value;
        if (rawVal === undefined || rawVal === null || rawVal === '') {
          rawVal = '—';
        }
        const valStr = String(rawVal);
        const isUrl = /^https?:\/\//i.test(valStr);
        const escapedVal = this.escape(valStr);
        const displayVal = isUrl
          ? `<a href="${escapedVal}" target="_blank" style="color:#128ACB;word-break:break-all;text-decoration:underline;">${escapedVal}</a>`
          : escapedVal;

        const isLongText =
          valStr.length > 70 ||
          /reason|message|address/i.test(detail.label);

        if (isLongText) {
          return `<tr>
          <td colspan="2" style="padding:12px 0 8px 0;border-bottom:1px solid #E6E9EF;">
            <div style="font-size:12px;font-weight:700;color:#8A93A5;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
            <div style="font-size:13px;font-weight:400;line-height:1.6;color:#1A2744;background:#FFFFFF;border:1px solid #E6E9EF;border-radius:6px;padding:12px 14px;white-space:pre-wrap;word-break:break-word;text-align:left;">${displayVal}</div>
          </td>
        </tr>`;
        }

        return `<tr>
          <td style="padding:10px 12px 10px 0;font-size:13px;color:#8A93A5;border-bottom:1px solid #E6E9EF;width:36%;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;font-size:13px;font-weight:600;color:#1A2744;border-bottom:1px solid #E6E9EF;vertical-align:top;word-break:break-word;text-align:left;">${displayVal}</td>
        </tr>`;
      })
      .join('\n');

    let cvSectionHtml = '';
    if (params.cvLink) {
      const cvUrl = this.escape(params.cvLink);
      cvSectionHtml = `
          <!-- CV Callout -->
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #128ACB;background:#F0F8FD;border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#1A2744;">
                      Attached Curriculum Vitae (CV)
                    </p>
                    <p style="margin:0 0 14px 0;font-size:13px;line-height:1.5;color:#5C6578;">
                      The applicant attached a CV document with this application. You can download or view it directly:
                    </p>
                    <a href="${cvUrl}" target="_blank" style="display:inline-block;background:#128ACB;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;">
                      View / Download CV &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New ${formType} Form Submission</title>
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
                    Website Notification
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

          <!-- Header -->
          <tr>
            <td style="padding:32px 28px 12px 28px;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#128ACB;">
                ${formType} Form
              </p>
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:700;color:#1A2744;">
                New ${formType} Submission Received
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#5C6578;">
                A new submission has been received from the HCG Foundation website. Below are the details submitted by the applicant:
              </p>
            </td>
          </tr>

          <!-- Submission details table -->
          <tr>
            <td style="padding:16px 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#1A2744;">
                      Submitted Form Details
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${rowsHtml}
                      <tr>
                        <td style="padding:10px 12px 10px 0;font-size:13px;color:#8A93A5;width:36%;">Submitted At</td>
                        <td style="padding:10px 0;font-size:13px;font-weight:600;color:#1A2744;text-align:left;">${this.escape(dateLabel)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${cvSectionHtml}

          <!-- Footer info -->
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#8A93A5;">
                This notification was automatically sent to pcc.hcgf@hcgel.com upon successful submission.
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
                Automated notification &bull; HCG Foundation
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
