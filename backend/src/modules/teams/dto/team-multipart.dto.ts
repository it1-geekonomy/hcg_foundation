import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateTeamMultipartDto {
  @ApiProperty({ example: 'Dr. John Smith' })
  title: string;

  @ApiPropertyOptional({ example: 'Senior Oncologist' })
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image (WebP or AVIF, max 5MB)',
  })
  teamImage?: unknown;

  @ApiPropertyOptional({
    example: '<p>Dr. John Smith has over 20 years of experience in oncology...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 'Senior oncologist specializing in breast cancer treatment',
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

export class UpdateTeamMultipartDto {
  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  title?: string;

  @ApiPropertyOptional({ example: 'Senior Oncologist' })
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  teamImage?: unknown;

  @ApiPropertyOptional({
    example: '<p>Dr. John Smith has over 20 years of experience in oncology...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 'Senior oncologist specializing in breast cancer treatment',
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
