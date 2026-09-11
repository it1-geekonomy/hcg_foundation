import { PartialType } from '@nestjs/swagger';
import { CreateFundraisingCampaignDto } from './create-fundraising-campaign.dto';

export class UpdateFundraisingCampaignDto extends PartialType(
  CreateFundraisingCampaignDto,
) {}
