import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeadContactDto extends SeoFieldsDto {
  @ApiProperty({ description: 'fullName' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'email' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  @IsString()
  status?: string;
}
