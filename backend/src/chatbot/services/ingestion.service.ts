import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiServiceClient } from './ai-service-client';
import { SOURCE_TABLES, SourceTableConfig } from '../config/source-tables.config';

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * NestJS reads published CMS rows and hands rich documents to the Python
 * RAG service. Chunking / embedding / retrieval stay in ai-service.
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly aiService: AiServiceClient,
  ) {}

  async reindexAll(): Promise<{ table: string; rowsProcessed: number }[]> {
    const results = [];
    for (const tableConfig of SOURCE_TABLES) {
      results.push(await this.reindexTable(tableConfig.table));
    }
    // Also ask AI service to rebuild static + knowledge corpus fingerprint sync.
    await this.aiService.fullSync(false);
    return results;
  }

  async reindexTable(tableName: string) {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) {
      throw new Error(`No source config found for table "${tableName}"`);
    }

    const rows = await this.queryIndexableRows(tableConfig);

    for (const row of rows) {
      await this.pushRow(tableConfig, row);
    }

    this.logger.log(`Backfilled ${tableName}: ${rows.length} published rows`);
    return { table: tableName, rowsProcessed: rows.length };
  }

  async reindexRow(tableName: string, id: string): Promise<void> {
    const tableConfig = SOURCE_TABLES.find((t) => t.table === tableName);
    if (!tableConfig) return;

    const rows = await this.queryIndexableRows(tableConfig, id);
    if (rows.length === 0) {
      await this.deleteRowChunks(tableName, id);
      return;
    }

    await this.pushRow(tableConfig, rows[0]);
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

  private async queryIndexableRows(
    tableConfig: SourceTableConfig,
    id?: string,
  ): Promise<Record<string, unknown>[]> {
    const selectCols = new Set<string>([
      tableConfig.idColumn,
      ...tableConfig.textColumns,
    ]);
    if (tableConfig.titleColumn) selectCols.add(tableConfig.titleColumn);
    if (tableConfig.slugColumn) selectCols.add(tableConfig.slugColumn);
    if (tableConfig.designationColumn) {
      selectCols.add(tableConfig.designationColumn);
    }
    if (tableConfig.statusColumn) selectCols.add(tableConfig.statusColumn);

    const columns = [...selectCols].join(', ');
    const params: unknown[] = [];
    let sql = `SELECT ${columns} FROM ${tableConfig.table} WHERE deleted_at IS NULL`;

    if (tableConfig.statusColumn === 'status') {
      sql += ` AND status = 'published'`;
    } else if (tableConfig.statusColumn === 'is_active') {
      sql += ` AND is_active = true`;
    }

    if (id) {
      params.push(id);
      sql += ` AND ${tableConfig.idColumn} = $1`;
    }

    return this.dataSource.query(sql, params);
  }

  private async pushRow(
    tableConfig: SourceTableConfig,
    row: Record<string, unknown>,
  ): Promise<void> {
    const id = String(row[tableConfig.idColumn]);
    const title = String(
      row[tableConfig.titleColumn ?? 'title'] ?? tableConfig.category,
    );
    const designation = tableConfig.designationColumn
      ? (row[tableConfig.designationColumn] as string | null | undefined)
      : undefined;
    const slug = tableConfig.slugColumn
      ? (row[tableConfig.slugColumn] as string | null | undefined)
      : undefined;

    const bodyParts = tableConfig.textColumns
      .map((col) => {
        const raw = row[col];
        if (raw === null || raw === undefined || raw === '') return null;
        const text =
          typeof raw === 'string' ? stripHtml(raw) : String(raw).trim();
        if (!text) return null;
        const label = col
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return `${label}: ${text}`;
      })
      .filter(Boolean);

    // Title + Category + Designation first so chunking cannot bury the role.
    const header = [
      `Title: ${title}`,
      `Category: ${tableConfig.category}`,
      designation ? `Designation: ${designation}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const content = [header, ...bodyParts].join('\n\n');
    if (!content.trim()) {
      await this.deleteRowChunks(tableConfig.table, id);
      return;
    }

    await this.aiService.syncEvent({
      table: tableConfig.table,
      source_id: id,
      action: 'upsert',
      content,
      title,
      url: tableConfig.buildUrl(row),
      category: tableConfig.category,
      slug: slug ?? undefined,
      designation: designation ?? undefined,
    });
  }
}
