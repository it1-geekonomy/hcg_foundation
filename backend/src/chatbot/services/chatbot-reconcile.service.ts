import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from './ingestion.service';

/** Gives the AI service time to come up when the whole stack starts together. */
const FIRST_RUN_DELAY_MS = 2 * 60_000;

/**
 * Safety net behind the instant CMS sync: periodically makes the chatbot
 * index match the published CMS rows and the live website pages, covering
 * edits whose sync failed (AI service restarting, OpenAI error) and writes
 * that bypass TypeORM hooks.
 */
@Injectable()
export class ChatbotReconcileService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ChatbotReconcileService.name);
  private readonly timers: NodeJS.Timeout[] = [];
  private running = false;

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    const minutes = this.configService.get<number>('ai.reconcileMinutes') ?? 60;
    if (!Number.isFinite(minutes) || minutes <= 0) return;

    const first = setTimeout(() => void this.run(), FIRST_RUN_DELAY_MS);
    const every = setInterval(() => void this.run(), minutes * 60_000);
    // Never keep the process alive just for this (e.g. one-off scripts)
    first.unref();
    every.unref();
    this.timers.push(first, every);
  }

  onApplicationShutdown() {
    this.timers.forEach((timer) => clearTimeout(timer));
  }

  async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const results = await this.ingestionService.reindexAll();
      const rows = results.reduce((sum, r) => sum + r.rowsProcessed, 0);
      const failed = results.reduce((sum, r) => sum + r.failed, 0);
      const removed = results.reduce((sum, r) => sum + r.chunksRemoved, 0);
      const message = `Chatbot knowledge check: ${rows} published rows, ${failed} failed, ${removed} stale chunks removed`;
      if (failed) this.logger.warn(message);
      else this.logger.log(message);
    } catch (err) {
      this.logger.warn(`Chatbot knowledge check failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
