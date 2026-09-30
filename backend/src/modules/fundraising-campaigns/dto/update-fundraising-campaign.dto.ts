import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CampaignStatus } from '../../../common/enums/campaign-status.enum';
import { CreateFundraisingCampaignDto } from './create-fundraising-campaign.dto';

export class UpdateFundraisingCampaignDto extends PartialType(
  CreateFundraisingCampaignDto,
) {
  @ApiPropertyOptional({
    enum: CampaignStatus,
    description: 'Campaign status',
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
