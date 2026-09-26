import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePartnershipInquiryDto {
  @ApiProperty({ example: 'Vikram Mehta', description: 'Full name of the contact person' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'vikram@csr-foundation.org', description: 'Official email address' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+91 9876543210', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'Mehta Philanthropies Ltd',
    description: 'Name of the organization (Optional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string;

  @ApiProperty({
    example: 'We would like to collaborate on CSR funding for rural cancer screening camps.',
    description: 'Inquiry details and message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: true, description: 'Acceptance of Terms & Conditions' })
  @IsBoolean()
  @Type(() => Boolean)
  termsAccepted: boolean;
}
