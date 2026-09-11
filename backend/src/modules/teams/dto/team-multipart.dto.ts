import { ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateTeamMultipartDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  teamImage?: unknown;

  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional()
  schemaCode?: string;
}

export class UpdateTeamMultipartDto extends CreateTeamMultipartDto {}
