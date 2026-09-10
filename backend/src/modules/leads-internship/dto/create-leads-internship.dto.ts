import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsBoolean, 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsDateString, 
  MaxLength 
} from 'class-validator';

export class CreateLeadsInternshipDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'jane.smith@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'Female' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @ApiPropertyOptional({ example: '2000-05-15', description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 'B.Tech Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  currentCourse?: string;

  @ApiPropertyOptional({ example: '123 Main Street, Bengaluru' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'English, Hindi, Kannada' })
  @IsOptional()
  @IsString()
  languages?: string;

  @ApiPropertyOptional({ example: 'MS Office, Python, Basic HTML' })
  @IsOptional()
  @IsString()
  computerSkills?: string;

  @ApiPropertyOptional({ example: 'I am interested in the internship program.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: true, description: 'Terms and conditions accepted' })
  @IsBoolean()
  termsAccepted: boolean;
}
