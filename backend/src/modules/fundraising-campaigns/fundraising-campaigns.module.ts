import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundraisingCampaign } from './entities/fundraising-campaign.entity';
import { FundraisingCampaignsController } from './fundraising-campaigns.controller';
import { FundraisingCampaignsService } from './fundraising-campaigns.service';

@Module({
  imports: [TypeOrmModule.forFeature([FundraisingCampaign])],
  controllers: [FundraisingCampaignsController],
  providers: [FundraisingCampaignsService],
  exports: [FundraisingCampaignsService],
})
export class FundraisingCampaignsModule {}
