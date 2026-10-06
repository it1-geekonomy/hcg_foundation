import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AskQuestionDto {
  @ApiProperty({ example: 'How can I donate to HCG Foundation?', maxLength: 1000 })
  @IsString()
  @MinLength(1)
  // Bounds the OpenAI cost of a single message; the rate limit bounds the count
  @MaxLength(1000)
  question: string;

  @ApiPropertyOptional({
    description:
      'Session id returned by a previous reply, for follow-ups. Omit to start a new conversation.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'sessionId must be a session id returned by the chatbot' })
  sessionId?: string;
}
