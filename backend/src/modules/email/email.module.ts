import { Module } from '@nestjs/common';
import { DonationCertificateService } from './donation-certificate.service';
import { DonationReceiptService } from './donation-receipt.service';
import { EmailService } from './email.service';

@Module({
  providers: [DonationCertificateService, DonationReceiptService, EmailService],
  exports: [EmailService, DonationCertificateService, DonationReceiptService],
})
export class EmailModule {}
