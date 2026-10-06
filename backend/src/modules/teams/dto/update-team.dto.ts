import { IntersectionType, PartialType } from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto extends IntersectionType(
  PartialType(CreateTeamDto),
  DisplayOrderModeDto,
) {}
