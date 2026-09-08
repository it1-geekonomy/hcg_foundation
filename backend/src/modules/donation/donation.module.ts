import { Module } from '@nestjs/common';
import { DonorsModule } from './donors/donors.module';

/**
 * Donation page domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [
    DonorsModule,
  ],
  exports: [
    DonorsModule,
  ],
})
export class DonationModule {}
