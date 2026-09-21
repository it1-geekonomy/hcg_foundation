import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail = 'onboarding@resend.dev';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not defined in environment variables. Emails will not be sent.');
    }
    this.resend = new Resend(apiKey);
  }

  async sendDonationReceipt(donor: any): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`Skipping donation receipt for ${donor.email} because RESEND_API_KEY is missing.`);
      return;
    }

    if (!donor.email) {
      this.logger.warn(`Skipping donation receipt because donor provided no email.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `HCG Foundation <${this.fromEmail}>`,
        to: [donor.email],
        subject: 'Thank you for your donation - Receipt',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #2c3e50;">Thank You, ${donor.fullName}!</h2>
            <p>We have successfully received your generous donation to the HCG Foundation.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">Donation Details</h3>
              <p><strong>Receipt Number:</strong> ${donor.receiptNumber}</p>
              <p><strong>Amount:</strong> ${donor.currency} ${donor.amount}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <p>Your support helps us make a difference. Please keep this receipt for your records.</p>
            
            <br/>
            <p style="font-size: 14px; color: #7f8c8d;">
              Warm regards,<br/>
              <strong>HCG Foundation Team</strong>
            </p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send receipt to ${donor.email}: ${error.message}`);
        return;
      }

      this.logger.log(`Donation receipt sent successfully to ${donor.email} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Error sending email to ${donor.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}
