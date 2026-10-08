import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Request } from 'express';
import { ChatbotController } from './chatbot.controller';
import { AiServiceClient } from './services/ai-service-client';
import { IngestionService } from './services/ingestion.service';
import { ChatService } from './services/chat.service';
import { ChatbotSyncSubscriber } from './services/chatbot-sync.subscriber';
import { ChatbotReconcileService } from './services/chatbot-reconcile.service';

const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Guards run before validation, so the body is still unchecked here.
function sessionOf(req: Request): string | null {
  const id = (req.body as { sessionId?: unknown } | undefined)?.sessionId;
  return typeof id === 'string' && SESSION_ID.test(id) ? id : null;
}

@Module({
  imports: [
    // Every chat message is a paid OpenAI call. Mobile carriers (CGNAT) and offices put
    // many visitors behind one IP, so pacing is per conversation and the IP limits only
    // cap abuse; a visitor's first message is never held back by other people's chats.
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'conversation',
          ttl: 60_000,
          limit: 10,
          skipIf: (ctx) => !sessionOf(ctx.switchToHttp().getRequest<Request>()),
          getTracker: (req) => `session:${sessionOf(req as Request)}`,
        },
        { name: 'ip-burst', ttl: 60_000, limit: 60 },
        { name: 'ip-hourly', ttl: 3_600_000, limit: 600 },
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
    ChatbotReconcileService, // hourly safety net for anything the instant sync missed
  ],
})
export class ChatbotModule {}
