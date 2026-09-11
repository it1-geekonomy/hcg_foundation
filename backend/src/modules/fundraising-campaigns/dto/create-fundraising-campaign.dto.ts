import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CampaignStatus } from '../../../common/enums/campaign-status.enum';

export class CreateFundraisingCampaignDto {
  @ApiProperty({ example: 'Ananya Sharma', description: 'Full name of applicant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '+91 9876543210', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phoneNumber: string;

  @ApiProperty({ example: 'ananya@example.com', description: 'Contact email address' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Bengaluru', description: 'City / Location' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  city: string;

  @ApiProperty({ example: '50000.00', description: 'Fundraising target amount' })
  @IsNotEmpty()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  @IsString()
  fundraisingGoal: string;

  @ApiProperty({
    example: 'Support pediatric cancer patient treatments',
    description: 'Why are you fundraising?',
  })
  @IsString()
  @IsNotEmpty()
  fundraisingReason: string;

  @ApiPropertyOptional({
    example: 'Looking forward to partnering with HCG Foundation',
    description: 'Applicant message',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: true, description: 'Acceptance of Terms & Conditions' })
  @IsBoolean()
  @Type(() => Boolean)
  termsAccepted: boolean;

  @ApiPropertyOptional({
    enum: CampaignStatus,
    default: CampaignStatus.PENDING,
    description: 'Campaign status',
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
