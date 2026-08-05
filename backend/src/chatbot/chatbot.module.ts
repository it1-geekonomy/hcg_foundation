import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { AiServiceClient } from './services/ai-service-client';
import { IngestionService } from './services/ingestion.service';
import { ChatService } from './services/chat.service';
import { ChatbotSyncSubscriber } from './services/chatbot-sync.subscriber';

@Module({
  controllers: [ChatbotController],
  providers: [
    AiServiceClient,
    IngestionService,
    ChatService,
    ChatbotSyncSubscriber, // auto keeps the AI service in sync with CMS inserts/updates/deletes
  ],
})
export class ChatbotModule {}
