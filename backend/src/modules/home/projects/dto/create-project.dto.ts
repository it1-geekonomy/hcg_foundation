import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoFieldsDto } from '../../../../common/dto/seo-fields.dto';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto extends SeoFieldsDto {
  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'summary' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'imageUrl' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'displayOrder' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'isFeatured' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
