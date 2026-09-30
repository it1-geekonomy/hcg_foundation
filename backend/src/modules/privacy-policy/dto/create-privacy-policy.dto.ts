import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreatePrivacyPolicyDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Privacy Policy' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Full privacy policy content (HTML / rich text)',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
