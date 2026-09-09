import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreatePatientStoryDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Aarav’s recovery story' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'aaravs-recovery-story' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/patients/aarav.jpg',
    description: 'Patient image URL',
  })
  @IsOptional()
  @IsString()
  patientImage?: string;

  @ApiPropertyOptional({
    example: '2024-06-15',
    description: 'Story date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'storyDate must be YYYY-MM-DD',
  })
  storyDate?: string;

  @ApiPropertyOptional({
    example: 'Karnataka',
    description: 'Donation / support state',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  donationState?: string;

  @ApiPropertyOptional({ description: 'Full story body (HTML / rich text)' })
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
