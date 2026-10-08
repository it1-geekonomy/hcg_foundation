import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazorpayService } from '../../common/payments/razorpay.service';
import { DonationEmailQueueService } from './donation-email-queue.service';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { Donor } from './entities/donor.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor]),
    EmailModule,
  ],
  controllers: [DonorsController],
  providers: [DonorsService, RazorpayService, DonationEmailQueueService],
  exports: [DonorsService, TypeOrmModule],
})
export class DonorsModule {}
