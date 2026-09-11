import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class UpdateTrusteeDto extends SeoFieldsDto {
  @ApiPropertyOptional({ example: 'Mrs. Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Board Member' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/trustees/mrs-jane-doe.jpg',
    description: 'Trustee image URL',
  })
  @IsOptional()
  @IsString()
  trusteeImage?: string;

  @ApiPropertyOptional({
    example: '<p>Mrs. Jane Doe has been a dedicated board member since 2015...</p>',
    description: 'Full bio/content (HTML / rich text)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'Philanthropist with 15+ years of experience in healthcare initiatives',
    description: 'Short blurb for cards',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    example: 'published',
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
