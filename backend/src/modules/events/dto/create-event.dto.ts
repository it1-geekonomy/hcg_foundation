import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateEventDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Pink Hope Awareness Walk' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'pink-hope-awareness-walk' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/events/walk-banner.jpg',
    description: 'Desktop event banner URL',
  })
  @IsOptional()
  @IsString()
  eventBanner?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/events/walk-banner-mobile.jpg',
    description: 'Mobile event banner URL',
  })
  @IsOptional()
  @IsString()
  eventMobileBanner?: string;

  @ApiPropertyOptional({
    example: '2026-10-12',
    description: 'Event date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'eventDate must be YYYY-MM-DD',
  })
  eventDate?: string;

  @ApiPropertyOptional({ example: 'HCG Hospital, Bengaluru' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventLocation?: string;

  @ApiPropertyOptional({
    example: '09:30',
    description: 'Event time (HH:MM or HH:MM:SS)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'eventTime must be HH:MM or HH:MM:SS',
  })
  eventTime?: string;

  @ApiPropertyOptional({ description: 'Full event body (HTML / rich text)' })
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
