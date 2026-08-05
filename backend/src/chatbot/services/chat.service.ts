import { Injectable } from '@nestjs/common';
import { AiServiceClient } from './ai-service-client';

/**
 * Thin proxy — NestJS stays the single entry point for the frontend
 * (consistent auth, rate limiting, logging), but the actual agentic
 * question-answering happens in the Python AI service.
 */
@Injectable()
export class ChatService {
  constructor(private readonly aiService: AiServiceClient) {}

  async answerQuestion(question: string): Promise<{ answer: string; sources: string[] }> {
    return this.aiService.chat(question);
  }
}
