import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { InquiryStatus } from '../../../common/enums/inquiry-status.enum';
import { CreatePartnershipInquiryDto } from './create-partnership-inquiry.dto';

export class UpdatePartnershipInquiryDto extends PartialType(
  CreatePartnershipInquiryDto,
) {
  @ApiPropertyOptional({
    enum: InquiryStatus,
    description: 'Inquiry status',
  })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
}
