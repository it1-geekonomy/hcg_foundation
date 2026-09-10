import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Kishan',
    description: 'Display name',
  })
  @IsString()
  @MaxLength(255)
  fullName: string;

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
    description:
      'Plain password (min 8 chars) — hashed on the server. Do NOT send passwordHash.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
