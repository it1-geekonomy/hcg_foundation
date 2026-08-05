import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskQuestionDto {
  @ApiProperty({ example: 'What programs do you offer for children?' })
  @IsString()
  @MinLength(2)
  question: string;
}
