import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiServiceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8001');
    this.apiKey = this.configService.get<string>('AI_SERVICE_INTERNAL_KEY');
  }

  async syncEvent(payload: {
    table: string;
    source_id: string;
    action: 'upsert' | 'delete';
    content?: string;
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

  async chat(question: string): Promise<{ answer: string; sources: string[] }> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': this.apiKey,
      },
      body: JSON.stringify({ question }),
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
