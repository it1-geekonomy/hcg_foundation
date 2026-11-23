import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DONATION_CURRENCIES } from '../donation-currency';
import { DonationCategory } from '../../../common/enums/donation-category.enum';

/**
 * CMS-only: record an offline / bank / FCRA / cheque donation without Razorpay.
 */
export class CreateManualDonorDto {
  @ApiProperty({ example: 'Anita Sharma' })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '') : value,
  )
  @ValidateIf((_, v) => v !== undefined && v !== null && v !== '')
  @IsString()
  @Matches(/^[+]?\d{8,15}$/, {
    message: 'phone must be 8–15 digits',
  })
  phone?: string;

  @ApiProperty({ example: 'anita@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({
    example: '12 MG Road, Bengaluru, Karnataka 560001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'True if the donor is outside India (e.g. FCRA remittance)',
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
    enum: DONATION_CURRENCIES,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return typeof value === 'string' ? value.trim().toUpperCase() : value;
  })
  @IsIn([...DONATION_CURRENCIES])
  currency?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @IsString()
  @MaxLength(20)
  pan?: string;

  @ApiPropertyOptional({ example: 'NEFT UTR 123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentReference?: string;

  @ApiPropertyOptional({ example: 'Cheque donation received at office' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({
    enum: DonationCategory,
    default: DonationCategory.GENERAL_FUNDS,
  })
  @IsOptional()
  @IsEnum(DonationCategory)
  donationCategory?: DonationCategory;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(9_999_999_999.99)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientStoryId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Queue 80G / receipt email (default true when email is set)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  sendReceiptEmail?: boolean;
}
