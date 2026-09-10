import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or username',
    example: 'kishan10@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Account password (same plain password used at create)',
    example: 'password@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
