import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  IsBoolean, IsNotEmpty,
  IsEmail, 
  IsString, 
  MaxLength 
} from 'class-validator';

export class CreateVolunteerDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'jane.smith@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Bengaluru' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cityLocation: string;

  @ApiProperty({ example: 'B.Tech Computer Science' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  educationalQualification: string;

  @ApiProperty({ example: 'Patient Support' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  areasOfInterest: string;

  @ApiProperty({ example: 'I want to help the community.' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ example: false, description: 'Terms and conditions accepted' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    return value === true || value === 'true' || value === '1';
  })
  @IsNotEmpty()
  @IsBoolean()
  termsAccepted: boolean = false;
}
