import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateTrusteeMultipartDto {
  @ApiProperty({ example: 'Mrs. Jane Doe' })
  title: string;

  @ApiPropertyOptional({ example: 'Board Member' })
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Trustee image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  trusteeImage?: unknown;

  @ApiPropertyOptional({
    example: '<p>Mrs. Jane Doe has been a dedicated board member since 2015...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 'Philanthropist with 15+ years of experience in healthcare initiatives',
  })
  shortDescription?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], example: 'draft' })
  status?: string;

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional()
  schemaCode?: string;
}

export class UpdateTrusteeMultipartDto {
  @ApiPropertyOptional({ example: 'Mrs. Jane Doe' })
  title?: string;

  @ApiPropertyOptional({ example: 'Board Member' })
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Trustee image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  trusteeImage?: unknown;

  @ApiPropertyOptional({
    example: '<p>Mrs. Jane Doe has been a dedicated board member since 2015...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 'Philanthropist with 15+ years of experience in healthcare initiatives',
  })
  shortDescription?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], example: 'published' })
  status?: string;

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional()
  schemaCode?: string;
}
