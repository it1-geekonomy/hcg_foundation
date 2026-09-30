import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { ListRecentlyDeletedQueryDto } from './dto/list-recently-deleted-query.dto';
import {
  RECENTLY_DELETED_RESOURCES,
  RecentlyDeletedResource,
} from './recently-deleted.resources';

export type RecentlyDeletedItem = {
  resource: RecentlyDeletedResource;
  id: string;
  title: string;
  deletedAt: Date;
  restorePath: string;
};

@Injectable()
export class RecentlyDeletedService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(
    query: ListRecentlyDeletedQueryDto,
  ): Promise<PaginatedResult<RecentlyDeletedItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const search = query.search?.trim() ?? '';

    const sources = query.resource
      ? RECENTLY_DELETED_RESOURCES.filter((r) => r.resource === query.resource)
      : [...RECENTLY_DELETED_RESOURCES];

    const unionSql = sources
      .map(
        (r) => `
          SELECT
            '${r.resource}' AS resource,
            id::text AS id,
            COALESCE(${r.titleSql}::text, '') AS title,
            deleted_at AS "deletedAt",
            '/${r.resource}/' || id::text || '/restore' AS "restorePath"
          FROM "${r.table}"
          WHERE deleted_at IS NOT NULL
        `,
      )
      .join(' UNION ALL ');

    const whereSearch = search ? `WHERE items.title ILIKE $1` : '';
    const params = search ? [`%${search}%`] : [];
    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;

    const countRows: Array<{ count: string }> = await this.dataSource.query(
      `SELECT COUNT(*)::text AS count FROM (${unionSql}) items ${whereSearch}`,
      params,
    );
    const total = Number(countRows[0]?.count ?? 0);

    const data: RecentlyDeletedItem[] = await this.dataSource.query(
      `
      SELECT * FROM (${unionSql}) items
      ${whereSearch}
      ORDER BY items."deletedAt" DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      [...params, limit, offset],
    );

    return buildPaginatedResult(data, total, page, limit);
  }
}
