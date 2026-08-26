import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiServiceClient } from './ai-service-client';
import { SOURCE_TABLES } from '../config/source-tables.config';

function stripHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * NestJS reads CMS rows and pushes sync events to the AI service.
 * Chunking / embeddings / vector search live entirely in ai-service.
 */
@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private readonly isMysql: boolean;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly aiService: AiServiceClient,
    private readonly config: ConfigService,
  ) {
    this.isMysql = (this.config.get<string>('DB_TYPE', 'mysql') || 'mysql') === 'mysql';
  }

  async onModuleInit() {
    if (this.config.get<string>('CHATBOT_AUTO_REINDEX', 'false') !== 'true') return;

    // Retry a few times — ai-service may still be downloading the embedding model.
    void this.autoReindexWithRetry();
  }

  private async autoReindexWithRetry(attempts = 5, delayMs = 5000) {
    for (let i = 1; i <= attempts; i++) {
      try {
        await new Promise((r) => setTimeout(r, delayMs));
        const results = await this.reindexAll();
        const total = results.reduce((sum, r) => sum + r.rowsProcessed, 0);
        this.logger.log(`Auto-reindex complete: ${total} rows across ${results.length} tables`);
        return;
      } catch (err: any) {
        this.logger.warn(`Auto-reindex attempt ${i}/${attempts} failed: ${err.message}`);
        if (i === attempts) {
          this.logger.error('Auto-reindex gave up — call POST /api/chatbot/reindex later');
        }
      }
    }
  }

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

    const columns = [tableConfig.idColumn, ...tableConfig.textColumns]
      .map((c) => this.quoteIdent(c))
      .join(', ');
    const rows = await this.dataSource.query(
      `SELECT ${columns} FROM ${this.quoteIdent(tableName)}`,
    );

    for (const row of rows) {
      await this.reindexRow(tableName, String(row[tableConfig.idColumn]));
    }

    this.logger.log(`Backfilled ${tableName}: ${rows.length} rows`);
    return { table: tableName, rowsProcessed: rows.length };
  }

  async reindexRow(tableName: string, id: string): Promise<void> {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    const columns = [tableConfig.idColumn, ...tableConfig.textColumns]
      .map((c) => this.quoteIdent(c))
      .join(', ');
    const placeholder = this.isMysql ? '?' : '$1';
    const rows = await this.dataSource.query(
      `SELECT ${columns} FROM ${this.quoteIdent(tableName)} WHERE ${this.quoteIdent(tableConfig.idColumn)} = ${placeholder}`,
      [id],
    );

    if (rows.length === 0) {
      await this.deleteRowChunks(tableName, id);
      return;
    }

    const row = rows[0];
    const content = tableConfig.textColumns
      .map((col) => stripHtml(row[col]))
      .filter(Boolean)
      .join('\n\n');

    if (!content.trim()) {
      await this.deleteRowChunks(tableName, id);
      return;
    }

    await this.aiService.syncEvent({
      table: tableName,
      source_id: id,
      action: 'upsert',
      content,
    });
  }

  async deleteRowChunks(tableName: string, id: string): Promise<void> {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    await this.aiService.syncEvent({
      table: tableName,
      source_id: id,
      action: 'delete',
    });
  }

  private quoteIdent(name: string): string {
    if (this.isMysql) return `\`${name}\``;
    return `"${name}"`;
  }
}
