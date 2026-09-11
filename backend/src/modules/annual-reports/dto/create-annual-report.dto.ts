import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateAnnualReportDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Annual Report 2024-25' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'annual-report-2024-25' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: '2024-2025',
    description:
      'Reporting financial or calendar year (max 9 chars, e.g. 2024-25 or 2024-2025)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  reportYear?: string;

  @ApiPropertyOptional({
    description: 'Direct CDN/public URL of desktop banner if already uploaded',
  })
  @IsOptional()
  @IsString()
  annualReportBanner?: string;

  @ApiPropertyOptional({
    description: 'Direct CDN/public URL of mobile banner if already uploaded',
  })
  @IsOptional()
  @IsString()
  annualReportMobileBanner?: string;

  @ApiPropertyOptional({
    description:
      'Direct CDN/public URL of PDF or report file if already uploaded',
  })
  @IsOptional()
  @IsString()
  annualReportFile?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
