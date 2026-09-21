import { Module } from '@nestjs/common';
import { DonationCertificateService } from './donation-certificate.service';
import { EmailService } from './email.service';

@Module({
  providers: [DonationCertificateService, EmailService],
  exports: [EmailService, DonationCertificateService],
})
export class EmailModule {}
