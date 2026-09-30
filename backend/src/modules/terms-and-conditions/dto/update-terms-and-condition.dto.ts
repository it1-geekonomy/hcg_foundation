import { PartialType } from '@nestjs/swagger';
import { CreateTermsAndConditionDto } from './create-terms-and-condition.dto';

export class UpdateTermsAndConditionDto extends PartialType(
  CreateTermsAndConditionDto,
) {}
