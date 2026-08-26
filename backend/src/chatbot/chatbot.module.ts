import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { AiServiceClient } from './services/ai-service-client';
import { IngestionService } from './services/ingestion.service';
import { ChatService } from './services/chat.service';
import { ChatbotSyncSubscriber } from './services/chatbot-sync.subscriber';
import { MediaEnrichmentService } from './services/media-enrichment.service';
import { CmsModule } from '../cms/cms.module';

@Module({
  imports: [CmsModule],
  controllers: [ChatbotController],
  providers: [
    AiServiceClient,
    IngestionService,
    ChatService,
    MediaEnrichmentService,
    // Fires on TypeORM insert/update/delete for SOURCE_TABLES → ai-service sync
    ChatbotSyncSubscriber,
  ],
})
export class ChatbotModule {}
