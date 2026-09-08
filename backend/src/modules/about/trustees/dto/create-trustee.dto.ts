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

export class CreateTrusteeDto extends SeoFieldsDto {
  @ApiProperty({ description: 'name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'designation' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ description: 'bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'imageUrl' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'displayOrder' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
