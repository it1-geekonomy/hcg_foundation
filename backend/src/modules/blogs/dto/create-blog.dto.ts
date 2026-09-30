import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateBlogDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Advancements in Cancer Immunotherapy' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'advancements-in-cancer-immunotherapy' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Publication date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'blogDate must be YYYY-MM-DD',
  })
  blogDate?: string;

  @ApiPropertyOptional({ example: 'Dr. Ramesh S' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorName?: string;

  @ApiPropertyOptional({ example: 'Senior Oncologist & Trustee' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorDesignation?: string;

  @ApiPropertyOptional({
    description: 'Full blog article content (HTML or markdown)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Summary blurb for preview cards' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Direct CDN URL of desktop banner if already uploaded',
  })
  @IsOptional()
  @IsString()
  blogBanner?: string;

  @ApiPropertyOptional({
    description: 'Direct CDN URL of mobile banner if already uploaded',
  })
  @IsOptional()
  @IsString()
  blogMobileBanner?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
