import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DONATION_CURRENCIES } from '../donation-currency';

export class CreateDonationDto {
  @ApiProperty({ example: 'Anita Sharma' })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: '9876543210' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '') : value,
  )
  @IsString()
  @Matches(/^[+]?\d{8,15}$/, {
    message: 'phone must be 8–15 digits',
  })
  phone!: string;

  @ApiProperty({ example: 'anita@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'ISO 3166-1 alpha-2 country code',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'True if the donor is paying from outside India',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isInternational?: boolean;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Donation currency (INR for India; USD/EUR/… for international)',
    enum: DONATION_CURRENCIES,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return typeof value === 'string' ? value.trim().toUpperCase() : value;
  })
  @IsIn([...DONATION_CURRENCIES])
  currency?: string;

  @ApiPropertyOptional({
    example: 'ABCDE1234F',
    description: 'PAN or Aadhaar — only if 80G certificate is needed (India)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @IsString()
  @MaxLength(20)
  pan?: string;

  @ApiPropertyOptional({ example: 'Keep up the good work' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: 50,
    description: 'Donation amount in the selected currency major units',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(9_999_999_999.99)
  amount!: number;
}
