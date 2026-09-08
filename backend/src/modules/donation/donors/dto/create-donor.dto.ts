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

export class CreateDonorDto extends SeoFieldsDto {
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

  @ApiProperty({ description: 'amount' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'paymentStatus' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'paymentReference' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'message' })
  @IsOptional()
  @IsString()
  message?: string;
}
