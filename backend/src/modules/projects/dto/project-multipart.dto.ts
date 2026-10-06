import {
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateProjectDto } from './create-project.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateProjectMultipartDto extends CreateProjectDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (4:3 aspect ratio, e.g. 800x600px, WebP or AVIF, max 5MB)',
  })
  projectBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (4:3 aspect ratio, e.g. 800x600px, WebP or AVIF, max 5MB)',
  })
  projectMobileBanner?: unknown;
}

export class UpdateProjectMultipartDto extends IntersectionType(
  PartialType(CreateProjectMultipartDto),
  DisplayOrderModeDto,
) {}
