import { IntersectionType, PartialType } from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateImpactVideoDto } from './create-impact-video.dto';

export class UpdateImpactVideoDto extends IntersectionType(
  PartialType(CreateImpactVideoDto),
  DisplayOrderModeDto,
) {}
