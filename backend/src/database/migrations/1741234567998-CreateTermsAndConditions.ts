import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreateTermsAndConditions1741234567998
  implements MigrationInterface {
  name = 'CreateTermsAndConditions1741234567998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'terms_and_conditions',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
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
      `SELECT 1 FROM pg_indexes WHERE tablename = 'terms_and_conditions' AND indexname = 'idx_terms_and_conditions_status'`,
    );
    if (!statusIndexExists.length) {
      await queryRunner.createIndex(
        'terms_and_conditions',
        new TableIndex(statusIndex('terms_and_conditions')),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('terms_and_conditions', true);
  }
}
