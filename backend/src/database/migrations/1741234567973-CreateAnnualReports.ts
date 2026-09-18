import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { idColumn, seoColumns, timestampColumns } from '../migration.helpers';

export class CreateAnnualReports1741234567973 implements MigrationInterface {
  name = 'CreateAnnualReports1741234567973';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            name: 'annual_report_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'annual_report_file',
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
