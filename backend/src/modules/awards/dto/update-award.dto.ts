import { IntersectionType, PartialType } from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateAwardDto } from './create-award.dto';

export class UpdateAwardDto extends IntersectionType(
  PartialType(CreateAwardDto),
  DisplayOrderModeDto,
) {}
