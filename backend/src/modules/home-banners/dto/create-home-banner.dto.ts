import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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

  @ApiProperty({ description: 'Banner image URL (required)' })
  @IsString()
  @IsNotEmpty()
  bannerImageUrl: string;

  @ApiPropertyOptional({ description: 'Mobile banner image URL' })
  @IsOptional()
  @IsString()
  mobileBannerImageUrl?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  displayOrder: number;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean;
}
