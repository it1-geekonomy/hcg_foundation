import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { idColumn, seoColumns, timestampColumns } from '../migration.helpers';

export class CreateAnnualReportsAndBlogs1741234567995 implements MigrationInterface {
  name = 'CreateAnnualReportsAndBlogs1741234567995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create annual_reports table
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

    // Create blogs table
    await queryRunner.createTable(
      new Table({
        name: 'blogs',
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
            name: 'blog_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'blog_mobile_banner',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'blog_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'author_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'author_designation',
            type: 'varchar',
            length: '255',
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
      'blogs',
      new TableIndex({
        name: 'idx_blogs_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'blogs',
      new TableIndex({
        name: 'idx_blogs_blog_date',
        columnNames: ['blog_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blogs', true);
    await queryRunner.dropTable('annual_reports', true);
  }
}
