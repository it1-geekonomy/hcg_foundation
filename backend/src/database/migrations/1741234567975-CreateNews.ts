import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreateNews1741234567975 implements MigrationInterface {
  name = 'CreateNews1741234567975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present
    if (await queryRunner.hasTable('news')) {
      const isLegacy =
        (await queryRunner.hasColumn('news', 'image_url')) ||
        (await queryRunner.hasColumn('news', 'is_published'));
      if (isLegacy) {
        await queryRunner.dropTable('news', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'news',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'news_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'news_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'news_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
            enumName: 'content_status',
            isNullable: false,
            default: `'draft'`,
          },
          ...seoColumns(),
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'news',
      new TableIndex(statusIndex('news')),
    );

    await queryRunner.createIndex(
      'news',
      new TableIndex({
        name: 'idx_news_date',
        columnNames: ['news_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('news', true);
  }
}
