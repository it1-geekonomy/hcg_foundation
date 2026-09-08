import { Module } from '@nestjs/common';
import { LeadsContactModule } from './leads-contact/leads-contact.module';

/**
 * Contact Us page domain
 * Tables are independent — no FK relations between entities.
 */
@Module({
  imports: [
    LeadsContactModule,
  ],
  exports: [
    LeadsContactModule,
  ],
})
export class ContactModule {}
