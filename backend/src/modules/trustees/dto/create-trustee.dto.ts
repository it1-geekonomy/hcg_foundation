import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateTrusteeDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Mrs. Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'mrs-jane-doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

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
    example: 'draft',
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
