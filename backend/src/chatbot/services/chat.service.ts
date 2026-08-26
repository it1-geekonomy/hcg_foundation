import { Injectable } from '@nestjs/common';
import { AiServiceClient } from './ai-service-client';
import { ChatVisual, MediaEnrichmentService } from './media-enrichment.service';

/**
 * Thin proxy — NestJS stays the single entry point for the frontend
 * (consistent auth, rate limiting, logging), but the actual agentic
 * question-answering happens in the Python AI service.
 * Nest then attaches CMS visuals (images / reports) for richer UI.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiServiceClient,
    private readonly media: MediaEnrichmentService,
  ) {}

  async answerQuestion(question: string): Promise<{
    answer: string;
    sources: string[];
    cached?: boolean;
    visuals: ChatVisual[];
    insights: { label: string; value: string }[];
  }> {
    const result = await this.aiService.chat(question);
    const enriched = await this.media.enrich(result.sources || [], question);
    return {
      ...result,
      visuals: enriched.visuals,
      insights: enriched.insights,
    };
  }
}
