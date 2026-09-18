import { Injectable } from '@nestjs/common';
import { AiServiceClient, ChatResult } from './ai-service-client';

@Injectable()
export class ChatService {
  constructor(private readonly aiService: AiServiceClient) {}

  async answerQuestion(
    question: string,
    sessionId?: string,
  ): Promise<ChatResult> {
    return this.aiService.chat(question, sessionId);
  }
}
