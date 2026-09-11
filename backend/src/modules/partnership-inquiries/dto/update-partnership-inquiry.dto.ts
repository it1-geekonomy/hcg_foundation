import { PartialType } from '@nestjs/swagger';
import { CreatePartnershipInquiryDto } from './create-partnership-inquiry.dto';

export class UpdatePartnershipInquiryDto extends PartialType(
  CreatePartnershipInquiryDto,
) {}
