import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHomeBannerDto {
  @ApiProperty({ example: 'Hero Banner 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Welcome to HCG Foundation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Homepage Hero Section' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Short description for the banner' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description:
      'Banner image URL (leave empty if uploading bannerImage via multipart form-data)',
  })
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Mobile banner image URL (leave empty if uploading mobileBannerImage via multipart form-data)',
  })
  @IsOptional()
  @IsString()
  mobileBannerImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Profile image URL (leave empty if uploading profileImage via multipart form-data)',
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  displayOrder?: number = 1;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true' || value === '1';
  })
  @IsBoolean()
  isActive?: boolean = true;
}
