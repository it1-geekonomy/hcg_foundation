import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DonationCategory } from '../../../common/enums/donation-category.enum';
import { SubscriptionPeriod } from '../../../common/enums/subscription-period.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Rahul Sharma' })
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

  @ApiProperty({ example: 'rahul@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(8)
  countryCode?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isInternational?: boolean;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @IsString()
  @MaxLength(20)
  pan?: string;

  @ApiProperty({ example: 1000, description: 'Recurring donation amount in INR' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({
    enum: SubscriptionPeriod,
    default: SubscriptionPeriod.MONTHLY,
    description: 'Frequency of recurring donation: monthly, quarterly, yearly',
  })
  @IsOptional()
  @IsEnum(SubscriptionPeriod)
  period?: SubscriptionPeriod = SubscriptionPeriod.MONTHLY;

  @ApiPropertyOptional({ enum: DonationCategory })
  @IsOptional()
  @IsEnum(DonationCategory)
  donationCategory?: DonationCategory;

  @ApiPropertyOptional({ example: '452ae86b-5742-4ef0-807f-c472c7890c8d' })
  @IsOptional()
  @IsUUID()
  patientStoryId?: string;
}
