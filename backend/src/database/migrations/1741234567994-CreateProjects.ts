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

export class CreateProjects1741234567994 implements MigrationInterface {
  name = 'CreateProjects1741234567994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present
    if (await queryRunner.hasTable('projects')) {
      const isLegacy =
        (await queryRunner.hasColumn('projects', 'image_url')) ||
        (await queryRunner.hasColumn('projects', 'is_published'));
      if (isLegacy) {
        await queryRunner.dropTable('projects', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'projects',
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
            name: 'project_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'project_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'project_date',
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
      'projects',
      new TableIndex(statusIndex('projects')),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'idx_projects_date',
        columnNames: ['project_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projects', true);
  }
}
