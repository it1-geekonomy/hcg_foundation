import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { FundraisingCampaign } from './entities/fundraising-campaign.entity';
import { FundraisingCampaignsController } from './fundraising-campaigns.controller';
import { FundraisingCampaignsService } from './fundraising-campaigns.service';

@Module({
  imports: [TypeOrmModule.forFeature([FundraisingCampaign]), EmailModule],
  controllers: [FundraisingCampaignsController],
  providers: [FundraisingCampaignsService],
  exports: [FundraisingCampaignsService],
})
export class FundraisingCampaignsModule {}
