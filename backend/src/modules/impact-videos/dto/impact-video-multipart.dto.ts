import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateImpactVideoDto } from './create-impact-video.dto';

/** Swagger-only definition for multipart endpoints */
export class CreateImpactVideoMultipartDto extends CreateImpactVideoDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Impact video file (MP4 or WebM, max 50MB, no duration limit)',
  })
  videoFile?: unknown;
}

export class UpdateImpactVideoMultipartDto extends PartialType(
  CreateImpactVideoMultipartDto,
) {}
