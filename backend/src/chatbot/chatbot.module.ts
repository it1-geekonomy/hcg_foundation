import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatbotController } from './chatbot.controller';
import { AiServiceClient } from './services/ai-service-client';
import { IngestionService } from './services/ingestion.service';
import { ChatService } from './services/chat.service';
import { ChatbotSyncSubscriber } from './services/chatbot-sync.subscriber';

@Module({
  imports: [
    // Per visitor IP; every chat message is a paid OpenAI call
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'burst', ttl: 60_000, limit: 10 },
        { name: 'hourly', ttl: 3_600_000, limit: 100 },
      ],
      errorMessage:
        'You are sending messages too quickly. Please wait a minute and try again.',
    }),
  ],
  controllers: [ChatbotController],
  providers: [
    AiServiceClient,
    IngestionService,
    ChatService,
    ChatbotSyncSubscriber, // auto keeps the AI service in sync with CMS inserts/updates/deletes
  ],
})
export class ChatbotModule {}
