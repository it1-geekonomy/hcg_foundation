import { ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateTrusteeMultipartDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Trustee image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  trusteeImage?: unknown;

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

export class UpdateTrusteeMultipartDto extends CreateTrusteeMultipartDto {}
