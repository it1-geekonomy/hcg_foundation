import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ChatSource = {
  title: string;
  url: string;
};

export type ChatResult = {
  answer: string;
  sources: ChatSource[];
  session_id: string;
  response_time_ms: number;
};

@Injectable()
export class AiServiceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('ai.serviceUrl') ||
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8001';
    this.apiKey =
      this.configService.get<string>('ai.internalKey') ||
      this.configService.get<string>('AI_SERVICE_INTERNAL_KEY') ||
      '';
  }

  async syncEvent(payload: {
    table: string;
    source_id: string;
    action: 'upsert' | 'delete';
    content?: string;
    title?: string;
    url?: string;
    category?: string;
    slug?: string;
    designation?: string;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/internal/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(
        `AI service sync failed (${response.status}): ${text}`,
      );
    }
  }

  async fullSync(force = false): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': this.apiKey,
      },
      body: JSON.stringify({ force }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(
        `AI service full sync failed (${response.status}): ${text}`,
      );
    }

    return response.json();
  }

  async chat(
    message: string,
    sessionId?: string,
  ): Promise<ChatResult> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(
        `AI service chat failed (${response.status}): ${text}`,
      );
    }

    return response.json();
  }
}
