import { IntersectionType, PartialType } from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends IntersectionType(
  PartialType(CreateProjectDto),
  DisplayOrderModeDto,
) {}
