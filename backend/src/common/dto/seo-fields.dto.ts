import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Shared SEO meta fields for all page content APIs (except users). */
export class SeoFieldsDto {
  @ApiPropertyOptional({
    example: 'Trustees | HCG Foundation',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Meet the trustees of HCG Foundation.',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'JSON-LD / schema.org markup (raw string)',
  })
  @IsOptional()
  @IsString()
  schemaCode?: string;
}
