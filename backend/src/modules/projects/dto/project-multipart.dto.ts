import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateProjectMultipartDto extends CreateProjectDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  projectBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  projectMobileBanner?: unknown;
}

export class UpdateProjectMultipartDto extends PartialType(
  CreateProjectMultipartDto,
) {}
