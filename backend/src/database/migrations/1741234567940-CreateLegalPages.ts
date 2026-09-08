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

export class CreateLegalPages1741234567940 implements MigrationInterface {
  name = 'CreateLegalPages1741234567940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('legal_pages')) return;

    await queryRunner.createTable(
      new Table({
        name: 'legal_pages',
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
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'page_type',
            type: 'enum',
            enum: ['privacy_policy', 'terms_and_conditions'],
            enumName: 'legal_page_type',
            isNullable: false,
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
      'legal_pages',
      new TableIndex({
        name: 'idx_legal_pages_page_type',
        columnNames: ['page_type'],
      }),
    );
    await queryRunner.createIndex(
      'legal_pages',
      new TableIndex({
        name: 'idx_legal_pages_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('legal_pages', true);
    await queryRunner.query(`DROP TYPE IF EXISTS "legal_page_type"`);
  }
}
