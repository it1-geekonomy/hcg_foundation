import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazorpayService } from '../../common/payments/razorpay.service';
import { DonationEmailQueueService } from './donation-email-queue.service';
import { DonationSubscriptionsController } from './donation-subscriptions.controller';
import { DonationSubscriptionsService } from './donation-subscriptions.service';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { DonationSubscription } from './entities/donation-subscription.entity';
import { Donor } from './entities/donor.entity';
import { DonorCounterSettings } from './entities/donor-counter-settings.entity';
import { PatientStory } from '../patient-stories/entities/patient-story.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donor,
      DonationSubscription,
      PatientStory,
      DonorCounterSettings,
    ]),
    EmailModule,
  ],
  controllers: [DonorsController, DonationSubscriptionsController],
  providers: [
    DonorsService,
    DonationSubscriptionsService,
    RazorpayService,
    DonationEmailQueueService,
  ],
  exports: [DonorsService, TypeOrmModule],
})
export class DonorsModule {}
