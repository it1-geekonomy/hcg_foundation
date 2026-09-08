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

export class AlignAnnualReportsForR21741234567930
  implements MigrationInterface
{
  name = 'AlignAnnualReportsForR21741234567930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('annual_reports')) return;

    await queryRunner.createTable(
      new Table({
        name: 'annual_reports',
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
            name: 'report_year',
            type: 'varchar',
            length: '9',
            isNullable: true,
          },
          {
            name: 'annual_report_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'annual_report_file',
            type: 'text',
            isNullable: true,
          },
          ...seoColumns(),
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
            enumName: 'content_status',
            isNullable: false,
            default: `'draft'`,
          },
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'annual_reports',
      new TableIndex({
        name: 'idx_annual_reports_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('annual_reports', true);
  }
}
