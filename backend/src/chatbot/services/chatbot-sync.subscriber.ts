import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  QueryRunner,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  TransactionCommitEvent,
  TransactionRollbackEvent,
  UpdateEvent,
} from 'typeorm';
import { IngestionService } from './ingestion.service';
import { SOURCE_TABLES } from '../config/source-tables.config';

type RowRef = { table: string; id: string };

/**
 * Listens to every entity's save/remove events and, for tables listed in
 * SOURCE_TABLES, re-syncs the changed row with the chatbot index:
 * reindexRow() reads the row as saved and upserts it if it is published,
 * otherwise (draft, inactive, soft-deleted, removed) deletes its chunks.
 *
 * TypeORM fires these hooks inside the save's transaction, before COMMIT, so
 * rows are collected per transaction and synced only after it commits —
 * reading them earlier would see the previous version.
 *
 * Raw SQL and bulk query-builder writes do not fire hooks; the periodic
 * ChatbotReconcileService catches those.
 */
@Injectable()
@EventSubscriber()
export class ChatbotSyncSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(ChatbotSyncSubscriber.name);
  private readonly pending = new WeakMap<QueryRunner, Map<string, RowRef>>();
  private readonly running = new Map<string, Promise<void>>();

  constructor(
    @InjectDataSource() dataSource: DataSource,
    private readonly ingestionService: IngestionService,
  ) {
    // TypeORM doesn't auto-discover subscribers via NestJS DI.
    dataSource.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<any>) {
    this.track(event.queryRunner, event.metadata.tableName, event.entity);
  }

  afterUpdate(event: UpdateEvent<any>) {
    this.track(
      event.queryRunner,
      event.metadata.tableName,
      event.entity ?? event.databaseEntity,
    );
  }

  afterRemove(event: RemoveEvent<any>) {
    // remove() clears the id on the entity itself
    this.track(
      event.queryRunner,
      event.metadata.tableName,
      event.databaseEntity ?? event.entity,
      event.entityId,
    );
  }

  afterSoftRemove(event: SoftRemoveEvent<any>) {
    this.track(
      event.queryRunner,
      event.metadata.tableName,
      event.databaseEntity ?? event.entity,
      event.entityId,
    );
  }

  afterRecover(event: RecoverEvent<any>) {
    this.track(
      event.queryRunner,
      event.metadata.tableName,
      event.entity ?? event.databaseEntity,
      event.entityId,
    );
  }

  afterTransactionCommit(event: TransactionCommitEvent) {
    // Still active: only a savepoint was released, the outer transaction is open
    if (event.queryRunner.isTransactionActive) return;
    const rows = this.pending.get(event.queryRunner);
    if (!rows) return;
    this.pending.delete(event.queryRunner);
    rows.forEach((row) => this.sync(row));
  }

  afterTransactionRollback(event: TransactionRollbackEvent) {
    if (!event.queryRunner.isTransactionActive) {
      this.pending.delete(event.queryRunner);
    }
  }

  private track(
    queryRunner: QueryRunner | undefined,
    table: string,
    entity: any,
    entityId?: unknown,
  ) {
    const config = SOURCE_TABLES.find((t) => t.table === table);
    if (!config) return;

    const fallbackId =
      entityId && typeof entityId === 'object'
        ? (entityId as Record<string, unknown>)[config.idColumn]
        : entityId;
    const id = entity?.[config.idColumn] ?? fallbackId;
    if (id === undefined || id === null) return;

    const row: RowRef = { table, id: String(id) };
    if (queryRunner?.isTransactionActive) {
      const rows = this.pending.get(queryRunner) ?? new Map<string, RowRef>();
      rows.set(`${row.table}#${row.id}`, row);
      this.pending.set(queryRunner, rows);
      return;
    }
    this.sync(row);
  }

  /**
   * Fire-and-forget so the CMS save never waits on embeddings. Syncs of the
   * same row run one after another, so the last save always wins.
   */
  private sync({ table, id }: RowRef) {
    const key = `${table}#${id}`;
    const previous = this.running.get(key) ?? Promise.resolve();
    const next: Promise<void> = previous
      .then(() => this.ingestionService.reindexRow(table, id))
      .catch((err: Error) => {
        this.logger.error(`Chatbot sync failed for ${key}: ${err.message}`);
      })
      .finally(() => {
        if (this.running.get(key) === next) this.running.delete(key);
      });
    this.running.set(key, next);
  }
}
