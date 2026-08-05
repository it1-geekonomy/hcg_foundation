import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiServiceClient } from './ai-service-client';
import { SOURCE_TABLES } from '../config/source-tables.config';

/**
 * NestJS's job here is narrow: read CMS rows and hand them off to the
 * Python AI service. All chunking/embedding/vector-store logic lives over
 * there — this service never does AI work itself.
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly aiService: AiServiceClient,
  ) {}

  /** Full backfill: pushes every row from every configured table to the AI service. */
  async reindexAll(): Promise<{ table: string; rowsProcessed: number }[]> {
    const results = [];
    for (const tableConfig of SOURCE_TABLES) {
      const result = await this.reindexTable(tableConfig.table);
      results.push(result);
    }
    return results;
  }

  async reindexTable(tableName: string) {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) throw new Error(`No source config found for table "${tableName}"`);

    const columns = [tableConfig.idColumn, ...tableConfig.textColumns].join(', ');
    const rows = await this.dataSource.query(`SELECT ${columns} FROM ${tableName}`);

    for (const row of rows) {
      await this.reindexRow(tableName, String(row[tableConfig.idColumn]));
    }

    this.logger.log(`Backfilled ${tableName}: ${rows.length} rows`);
    return { table: tableName, rowsProcessed: rows.length };
  }

  /**
   * Reads one row, builds its combined text, and pushes an "upsert" event
   * to the AI service. Called by ChatbotSyncSubscriber on insert/update,
   * and by reindexTable() during backfill.
   */
  async reindexRow(tableName: string, id: string): Promise<void> {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    const columns = [tableConfig.idColumn, ...tableConfig.textColumns].join(', ');
    const rows = await this.dataSource.query(
      `SELECT ${columns} FROM ${tableName} WHERE ${tableConfig.idColumn} = $1`,
      [id],
    );

    if (rows.length === 0) {
      // Row no longer exists — treat like a delete.
      await this.deleteRowChunks(tableName, id);
      return;
    }

    const row = rows[0];
    const content = tableConfig.textColumns
      .map((col) => row[col])
      .filter(Boolean)
      .join('\n\n');

    await this.aiService.syncEvent({
      table: tableName,
      source_id: id,
      action: 'upsert',
      content,
    });
  }

  /** Pushes a "delete" event to the AI service. Called by ChatbotSyncSubscriber. */
  async deleteRowChunks(tableName: string, id: string): Promise<void> {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    await this.aiService.syncEvent({
      table: tableName,
      source_id: id,
      action: 'delete',
    });
  }
}
