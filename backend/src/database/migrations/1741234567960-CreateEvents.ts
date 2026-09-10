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
} from '../migration.helpers';

export class CreateEvents1741234567960 implements MigrationInterface {
  name = 'CreateEvents1741234567960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present (old columns: image_url, is_published, location)
    if (await queryRunner.hasTable('events')) {
      const isLegacy =
        (await queryRunner.hasColumn('events', 'image_url')) ||
        (await queryRunner.hasColumn('events', 'is_published')) ||
        (await queryRunner.hasColumn('events', 'location'));
      if (isLegacy) {
        await queryRunner.dropTable('events', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'events',
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
            name: 'event_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'event_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'event_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'event_location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'event_time',
            type: 'time',
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
      'events',
      new TableIndex({
        name: 'idx_events_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'idx_events_event_date',
        columnNames: ['event_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('events', true);
  }
}
