import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SoftRemoveEvent,
} from 'typeorm';
import { IngestionService } from './ingestion.service';
import { SOURCE_TABLES } from '../config/source-tables.config';

const TRACKED_TABLES = new Set(SOURCE_TABLES.map((t) => t.table));

/**
 * Listens to EVERY entity's save/remove events (no listenTo() override =
 * global listener), and — only for tables listed in SOURCE_TABLES — keeps
 * the chatbot's document_chunks in sync automatically:
 *
 *   INSERT / UPDATE a tracked row  -> re-chunk + re-embed just that row
 *   DELETE a tracked row           -> delete its chunks
 *
 * IMPORTANT CAVEAT: TypeORM subscribers only fire for operations that go
 * through the EntityManager/Repository (e.g. repo.save(), repo.remove()).
 * Raw SQL (dataSource.query(...)) or bulk `.update()/.delete()` query
 * builder calls do NOT trigger these hooks. If your CMS ever writes that
 * way, pair this with a periodic safety-net reindex (see README) or call
 * ingestionService.reindexRow()/deleteRowChunks() manually from that code path.
 */
@Injectable()
@EventSubscriber()
export class ChatbotSyncSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(ChatbotSyncSubscriber.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly ingestionService: IngestionService,
  ) {
    // TypeORM doesn't auto-discover subscribers via NestJS DI —
    // register this instance on the DataSource manually.
    dataSource.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<any>) {
    this.syncIfTracked(event.metadata.tableName, event.entity);
  }

  afterUpdate(event: UpdateEvent<any>) {
    this.syncIfTracked(event.metadata.tableName, event.entity);
  }

  afterRemove(event: RemoveEvent<any>) {
    this.deleteIfTracked(event.metadata.tableName, event.databaseEntity ?? event.entity);
  }

  afterSoftRemove(event: SoftRemoveEvent<any>) {
    // Treat a soft-delete the same as a hard delete for chatbot purposes —
    // if it's hidden from your site, it shouldn't show up in chat answers.
    this.deleteIfTracked(event.metadata.tableName, event.databaseEntity ?? event.entity);
  }

  private syncIfTracked(tableName: string, entity: any) {
    if (!TRACKED_TABLES.has(tableName) || !entity) return;

    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    const id = entity[tableConfig.idColumn];
    if (id === undefined) return;

    // Fire-and-forget so we don't slow down the CMS's own save() call.
    // Errors are caught and logged rather than thrown, so a slow/failed
    // embedding call never breaks the CMS write itself.
    this.ingestionService.reindexRow(tableName, String(id)).catch((err) => {
      this.logger.error(`Auto-sync failed for ${tableName}#${id}: ${err.message}`);
    });
  }

  private deleteIfTracked(tableName: string, entity: any) {
    if (!TRACKED_TABLES.has(tableName) || !entity) return;

    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    const id = entity[tableConfig.idColumn];
    if (id === undefined) return;

    this.ingestionService.deleteRowChunks(tableName, String(id)).catch((err) => {
      this.logger.error(`Auto-delete failed for ${tableName}#${id}: ${err.message}`);
    });
  }
}
