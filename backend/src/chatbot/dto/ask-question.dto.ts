import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AskQuestionDto {
  @ApiProperty({ example: 'How can I donate to HCG Foundation?' })
  @IsString()
  @MinLength(1)
  question: string;

  @ApiPropertyOptional({
    description: 'Optional conversation session id for follow-ups',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
