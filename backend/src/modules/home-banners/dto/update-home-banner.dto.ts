import { IntersectionType, PartialType } from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateHomeBannerDto } from './create-home-banner.dto';

export class UpdateHomeBannerDto extends IntersectionType(
  PartialType(CreateHomeBannerDto),
  DisplayOrderModeDto,
) {}
