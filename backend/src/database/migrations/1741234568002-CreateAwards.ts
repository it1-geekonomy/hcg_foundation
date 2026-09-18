import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  idColumn,
  timestampColumns,
  statusIndex,
  ensureUpdatedAtFunction,
  addUpdatedAtTrigger,
  dropUpdatedAtTrigger,
} from '../migration.helpers';

export class CreateAwards1741234568002 implements MigrationInterface {
  name = 'CreateAwards1741234568002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await ensureUpdatedAtFunction(queryRunner);

    await queryRunner.createTable(
      new Table({
        name: 'awards',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'year',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'award_image_url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
            default: 1,
          },
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
      'awards',
      new TableIndex(statusIndex('awards')),
    );

    await addUpdatedAtTrigger(queryRunner, 'awards');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropUpdatedAtTrigger(queryRunner, 'awards');
    await queryRunner.dropTable('awards', true);
  }
}
