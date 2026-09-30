import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AskQuestionDto {
  @ApiProperty({ example: 'How can I donate to HCG Foundation?', maxLength: 1000 })
  @IsString()
  @MinLength(1)
  // Bounds the OpenAI cost of a single message; the rate limit bounds the count
  @MaxLength(1000)
  question: string;

  @ApiPropertyOptional({
    description: 'Optional conversation session id for follow-ups',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sessionId?: string;
}
