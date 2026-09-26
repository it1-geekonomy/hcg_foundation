import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class CreateTermsAndConditionDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Terms of Service' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Full terms and conditions content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
