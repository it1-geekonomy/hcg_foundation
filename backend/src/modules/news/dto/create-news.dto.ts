import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateNewsDto extends SeoFieldsDto {
  @ApiProperty({ example: 'HCG Foundation Launches New Initiative' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'hcg-foundation-launches-new-initiative' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: '2026-10-12',
    description: 'News date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'newsDate must be YYYY-MM-DD',
  })
  newsDate?: string;

  @ApiPropertyOptional({ description: 'Full news body (HTML / rich text)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Short blurb for cards' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
