import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { Project } from '../projects/entities/project.entity';
import { FundraisingCampaign } from '../fundraising-campaigns/entities/fundraising-campaign.entity';
import { LeadsContact } from '../leads-contact/entities/leads-contact.entity';
import { Event } from '../events/entities/event.entity';
import { PartnershipInquiry } from '../partnership-inquiries/entities/partnership-inquiry.entity';
import { User } from '../users/entities/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donor,
      Project,
      FundraisingCampaign,
      LeadsContact,
      Event,
      PartnershipInquiry,
      User,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
