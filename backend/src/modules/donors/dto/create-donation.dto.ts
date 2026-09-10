import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

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
  @Matches(/^[+]?\d{10,15}$/, {
    message: 'phone must be 10–15 digits',
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

  @ApiPropertyOptional({
    example: 'ABCDE1234F',
    description: 'PAN or Aadhaar — only if 80G certificate is needed',
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
    example: 3000,
    description: 'Donation amount in INR (3000, 5000, or custom Other amount)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(9_999_999_999.99)
  amount!: number;
}
