import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../../common/enums/content-status.enum';
import { LegalPageType } from '../../../../common/enums/legal-page-type.enum';

export class CreateLegalPageDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Privacy Policy' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'privacy-policy' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ description: 'HTML / rich text body' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    enum: LegalPageType,
    example: LegalPageType.PRIVACY_POLICY,
  })
  @IsEnum(LegalPageType)
  pageType: LegalPageType;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
