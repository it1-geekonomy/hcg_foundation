import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../../common/enums/content-status.enum';

export class CreateAnnualReportDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Annual Report 2024-25' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'annual-report-2024-25' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: '2024-25', description: 'Report year label' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  reportYear?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
