import {
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateImpactVideoDto } from './create-impact-video.dto';

/** Swagger-only definition for multipart endpoints */
export class CreateImpactVideoMultipartDto extends CreateImpactVideoDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Impact video file (MP4 or WebM, no duration limit)',
  })
  videoFile?: unknown;
}

export class UpdateImpactVideoMultipartDto extends IntersectionType(
  PartialType(CreateImpactVideoMultipartDto),
  DisplayOrderModeDto,
) {}
