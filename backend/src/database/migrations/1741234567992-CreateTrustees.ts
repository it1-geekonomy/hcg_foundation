import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreateTrustees1741234567992 implements MigrationInterface {
  name = 'CreateTrustees1741234567992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trustees',
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
            name: 'designation',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'trustee_image',
            type: 'text',
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

    const statusIndexExists = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE tablename = 'trustees' AND indexname = 'idx_trustees_status'`,
    );
    if (!statusIndexExists.length) {
      await queryRunner.createIndex(
        'trustees',
        new TableIndex(statusIndex('trustees')),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trustees', true);
  }
}
