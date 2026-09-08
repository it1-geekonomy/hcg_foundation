import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Kishan',
    description: 'Display name',
  })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    example: 'kishan-10',
    description: 'URL-safe unique slug (optional — auto-generated from username)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug?: string;

  @ApiProperty({
    example: 'kishan10@gmail.com',
    description: 'Unique email (used for login)',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'kishan10',
    description: 'Unique username (used for login)',
  })
  @IsString()
  @MaxLength(255)
  username: string;

  @ApiProperty({
    example: 'password@123',
    description: 'Plain password (min 8 chars) — hashed on the server. Do NOT send passwordHash.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
